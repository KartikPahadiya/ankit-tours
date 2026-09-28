from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.booking import Booking
from app.models.user import User

from app.schemas.booking import (
    AvailabilityRequest,
    AvailabilityResponse,
    BookingDetailResponse,
    BookingResponse,
    CancellationResponse,
    CreateBookingRequest,
)

from app.services.booking_service import (
    check_availability,
    create_pending_booking,
    get_user_booking,
    get_user_booking_by_reference,
    cancel_booking,
)

from app.services.cancellation_service import calculate_refund

from app.services.payment_service import create_refund


router = APIRouter(
    prefix="/api/bookings",
    tags=["Bookings"],
)


@router.post(
    "/availability",
    response_model=AvailabilityResponse,
)
def availability(
    payload: AvailabilityRequest,
    db: Session = Depends(get_db),
):
    try:
        result = check_availability(
            db=db,
            room_id=payload.room_id,
            check_in=payload.check_in,
            check_out=payload.check_out,
            guests=payload.guests,
        )

        return result

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )


@router.post(
    "",
    response_model=BookingResponse,
)
def create_booking(
    payload: CreateBookingRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        booking = create_pending_booking(
            db=db,
            user=current_user,
            room_id=payload.room_id,
            check_in=payload.check_in,
            check_out=payload.check_out,
            guests=payload.guests,
        )

        return booking

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )


@router.get(
    "/my",
    response_model=list[BookingResponse],
)
def my_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    bookings = (
        db.query(Booking)
        .filter(
            Booking.user_id == current_user.id
        )
        .order_by(
            desc(Booking.created_at)
        )
        .all()
    )

    result = []

    for booking in bookings:
        result.append(
            {
                "id": booking.id,
                "booking_reference": booking.booking_reference,
                "room_id": booking.room_id,
                "check_in": booking.check_in,
                "check_out": booking.check_out,
                "guests": booking.guests,
                "total_amount": float(booking.total_amount),
                "status": booking.status,
                "expires_at": booking.expires_at,
                "created_at": booking.created_at,
                "payment_status": (
                    booking.payment.status
                    if booking.payment
                    else None
                ),
            }
        )

    return result


@router.get(
    "/{booking_id}",
    response_model=BookingDetailResponse,
)
def booking_details(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = get_user_booking(
        db=db,
        booking_id=booking_id,
        user_id=current_user.id,
    )

    if not booking:
        raise HTTPException(
            status_code=404,
            detail="Booking not found.",
        )

    payment = booking.payment

    return BookingDetailResponse(
        id=booking.id,
        booking_reference=booking.booking_reference,

        room_id=booking.room_id,
        room_name=booking.room.name,

        stay_id=booking.room.stay.id,
        stay_name=booking.room.stay.name,
        stay_slug=booking.room.stay.slug,

        check_in=booking.check_in,
        check_out=booking.check_out,

        guests=booking.guests,

        price_per_night=float(
            booking.room.price_per_night
        ),

        total_amount=float(
            booking.total_amount
        ),

        status=booking.status,

        expires_at=booking.expires_at,

        created_at=booking.created_at,

        payment_status=(
            payment.status
            if payment
            else None
        ),

        razorpay_payment_id=(
            payment.razorpay_payment_id
            if payment
            else None
        ),
    )


@router.get(
    "/reference/{booking_reference}",
    response_model=BookingDetailResponse,
)
def booking_by_reference(
    booking_reference: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = get_user_booking_by_reference(
        db=db,
        booking_reference=booking_reference,
        user_id=current_user.id,
    )

    if not booking:
        raise HTTPException(
            status_code=404,
            detail="Booking not found.",
        )

    payment = booking.payment

    return BookingDetailResponse(
        id=booking.id,
        booking_reference=booking.booking_reference,

        room_id=booking.room_id,
        room_name=booking.room.name,

        stay_id=booking.room.stay.id,
        stay_name=booking.room.stay.name,
        stay_slug=booking.room.stay.slug,

        check_in=booking.check_in,
        check_out=booking.check_out,

        guests=booking.guests,

        price_per_night=float(
            booking.room.price_per_night
        ),

        total_amount=float(
            booking.total_amount
        ),

        status=booking.status,

        expires_at=booking.expires_at,

        created_at=booking.created_at,

        payment_status=(
            payment.status
            if payment
            else None
        ),

        razorpay_payment_id=(
            payment.razorpay_payment_id
            if payment
            else None
        ),
    )


@router.post(
    "/{booking_id}/cancel",
    response_model=CancellationResponse,
)
def cancel(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = get_user_booking(
        db=db,
        booking_id=booking_id,
        user_id=current_user.id,
    )

    if not booking:
        raise HTTPException(
            status_code=404,
            detail="Booking not found.",
        )

    if booking.status == "cancelled":
        raise HTTPException(
            status_code=400,
            detail="Booking is already cancelled.",
        )

    refund_info = calculate_refund(
        check_in=booking.check_in,
        total_amount=float(
            booking.total_amount
        ),
    )

    payment = booking.payment

    # Atomically claim the cancellation.
    #
    # The conditional UPDATE transitions the booking out of
    # pending/confirmed only if it is still in one of those states.
    # Even with two concurrent requests (e.g. a double-click), only
    # one can win this transition, so a Razorpay refund can never be
    # issued twice for the same booking. (SQLite has no SELECT FOR
    # UPDATE, so a conditional UPDATE is the portable way to do
    # this.)
    claimed = (
        db.query(Booking)
        .filter(
            Booking.id == booking.id,
            Booking.status.in_(
                ["pending", "confirmed"]
            ),
        )
        .update(
            {
                "status": "cancelled",
                "expires_at": None,
            },
            synchronize_session="fetch",
        )
    )

    if claimed == 0:
        raise HTTPException(
            status_code=400,
            detail=(
                "Booking is already cancelled "
                "or cannot be cancelled."
            ),
        )

    db.commit()
    db.refresh(booking)

    refund_id = None
    payment_status = (
        payment.status
        if payment
        else None
    )

    try:
        # Paid booking with a refundable amount.
        if (
            payment is not None
            and payment.status == "captured"
            and refund_info["refund_amount"] > 0
        ):
            refund = create_refund(
                db=db,
                payment=payment,
                refund_amount=refund_info[
                    "refund_amount"
                ],
            )

            db.commit()

            refund_id = (
                refund["id"]
                if refund
                else None
            )

            payment_status = payment.status

        return CancellationResponse(
            booking_reference=booking.booking_reference,
            booking_status=booking.status,
            payment_status=payment_status,
            original_amount=float(
                booking.total_amount
            ),
            refund_percentage=refund_info[
                "refund_percentage"
            ],
            refund_amount=refund_info[
                "refund_amount"
            ],
            refund_id=refund_id,
        )

    except ValueError as exc:
        db.rollback()

        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to process cancellation."
            ),
        )