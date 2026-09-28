import json
from datetime import date, datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.booking import Booking
from app.models.booking_request import BookingRequest
from app.models.payment import Payment
from app.models.room import Room
from app.models.user import User
from app.schemas.payment import (
    CreateOrderResponse,
    VerifyPaymentRequest,
    PaymentResponse,
)
from app.services import request_service
from app.services.booking_service import (
    create_pending_booking,
    find_reusable_pending_booking,
    get_available_rooms,
)
from app.services.booking_notifications import (
    create_booking_confirmation_notifications,
)
from app.services.payment_service import (
    create_razorpay_order,
    create_razorpay_order_for_request,
    mark_payment_success,
    mark_request_payment_success,
    verify_payment_signature,
    verify_webhook_signature,
)
from app.services.payment_emails import send_payment_emails


router = APIRouter(
    prefix="/api/payments",
    tags=["Payments"],
)


@router.post(
    "/create-order",
    response_model=CreateOrderResponse,
)
def create_order(
    room_id: int | None = None,
    check_in: str | None = None,
    check_out: str | None = None,
    guests: int | None = None,
    request_id: int | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a Razorpay order for either an instant stay
    checkout (room + dates) or an admin-accepted booking
    request."""

    if request_id is not None:
        return create_order_for_request(
            request_id=request_id,
            db=db,
            current_user=current_user,
        )

    if (
        room_id is None
        or check_in is None
        or check_out is None
        or guests is None
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "Provide either request_id, or "
                "room_id + check_in + check_out + guests."
            ),
        )

    try:
        check_in_date = date.fromisoformat(check_in)
        check_out_date = date.fromisoformat(check_out)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Invalid date format.",
        )

    if guests < 1:
        raise HTTPException(
            status_code=400,
            detail="At least one guest is required.",
        )

    try:
        # Reuse the user's still-live hold for the same room and
        # dates instead of creating duplicate bookings when the
        # checkout is retried or the button is double-clicked.
        booking = find_reusable_pending_booking(
            db=db,
            user_id=current_user.id,
            room_id=room_id,
            check_in=check_in_date,
            check_out=check_out_date,
            guests=guests,
        )

        if booking:
            payment = (
                db.query(Payment)
                .filter(
                    Payment.booking_id == booking.id,
                    Payment.status == "created",
                )
                .first()
            )

            if not payment:
                payment = create_razorpay_order(
                    db=db,
                    booking=booking,
                )
        else:
            booking = create_pending_booking(
                db=db,
                user=current_user,
                room_id=room_id,
                check_in=check_in_date,
                check_out=check_out_date,
                guests=guests,
            )

            payment = create_razorpay_order(
                db=db,
                booking=booking,
            )

        return CreateOrderResponse(
            booking_id=booking.id,
            booking_reference=booking.booking_reference,
            razorpay_order_id=payment.razorpay_order_id,
            razorpay_key_id=settings.RAZORPAY_KEY_ID,
            amount=float(payment.amount),
            currency=payment.currency,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Unable to create payment order.",
        )


def create_order_for_request(
    request_id: int,
    db: Session,
    current_user: User,
) -> CreateOrderResponse:
    """Create (or reuse) the Razorpay order for an accepted
    booking request. Re-checks inventory for stays so an
    accepted request cannot pay for rooms that sold out."""

    request = (
        db.query(BookingRequest)
        .filter(
            BookingRequest.id == request_id,
            BookingRequest.user_id == current_user.id,
        )
        .first()
    )

    if not request:
        raise HTTPException(
            status_code=404,
            detail="Request not found.",
        )

    if request_service.effective_status(request) != "accepted":
        raise HTTPException(
            status_code=400,
            detail="This request is not awaiting payment.",
        )

    if request.amount is None or float(request.amount) <= 0:
        raise HTTPException(
            status_code=400,
            detail=(
                "Ankit has not set the amount for this "
                "request yet. Please wait for his "
                "confirmation on WhatsApp."
            ),
        )

    if request.type == "stay":
        if not request.check_in or not request.check_out:
            raise HTTPException(
                status_code=400,
                detail="This request has no dates.",
            )

        room = (
            db.query(Room)
            .filter(Room.id == request.item_id)
            .first()
        )

        if not room:
            raise HTTPException(
                status_code=404,
                detail="Room not found.",
            )

        available = get_available_rooms(
            db,
            room,
            request.check_in,
            request.check_out,
        )

        if available < request.rooms:
            raise HTTPException(
                status_code=409,
                detail=(
                    "Sorry — the rooms for your dates were "
                    "just taken. Please contact Ankit on "
                    "WhatsApp."
                ),
            )

    payment = (
        db.query(Payment)
        .filter(
            Payment.request_id == request.id,
            Payment.status == "created",
        )
        .first()
    )

    if not payment:
        payment = create_razorpay_order_for_request(
            db=db,
            request=request,
        )

    return CreateOrderResponse(
        request_id=request.id,
        request_reference=request.request_reference,
        razorpay_order_id=payment.razorpay_order_id,
        razorpay_key_id=settings.RAZORPAY_KEY_ID,
        amount=float(payment.amount),
        currency=payment.currency,
    )


@router.post("/verify")
def verify_payment(
    payload: VerifyPaymentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if payload.request_id is not None:
        return verify_request_payment(
            payload=payload,
            db=db,
            current_user=current_user,
        )

    if payload.booking_id is None:
        raise HTTPException(
            status_code=400,
            detail="booking_id or request_id is required.",
        )

    booking = (
        db.query(Booking)
        .filter(
            Booking.id == payload.booking_id,
            Booking.user_id == current_user.id,
        )
        .first()
    )

    if not booking:
        raise HTTPException(
            status_code=404,
            detail="Booking not found.",
        )

    payment = (
        db.query(Payment)
        .filter(
            Payment.booking_id == booking.id,
            Payment.razorpay_order_id
            == payload.razorpay_order_id,
        )
        .first()
    )

    if not payment:
        raise HTTPException(
            status_code=404,
            detail="Payment order not found.",
        )

    if payment.status == "captured":
        return {
            "success": True,
            "message": "Payment already verified.",
            "booking_reference": booking.booking_reference,
        }

    valid = verify_payment_signature(
        order_id=payload.razorpay_order_id,
        payment_id=payload.razorpay_payment_id,
        signature=payload.razorpay_signature,
    )

    if not valid:
        raise HTTPException(
            status_code=400,
            detail="Invalid payment signature.",
        )

    mark_payment_success(
        db=db,
        payment=payment,
        razorpay_payment_id=payload.razorpay_payment_id,
    )

    create_booking_confirmation_notifications(
        db=db,
        user=current_user,
        booking=booking,
    )

    # Receipt email to the customer + alert to the admin.
    send_payment_emails(payment)

    return {
        "success": True,
        "message": "Payment verified successfully.",
        "booking_reference": booking.booking_reference,
    }


def verify_request_payment(
    payload: VerifyPaymentRequest,
    db: Session,
    current_user: User,
):
    request = (
        db.query(BookingRequest)
        .filter(
            BookingRequest.id == payload.request_id,
            BookingRequest.user_id == current_user.id,
        )
        .first()
    )

    if not request:
        raise HTTPException(
            status_code=404,
            detail="Request not found.",
        )

    payment = (
        db.query(Payment)
        .filter(
            Payment.request_id == request.id,
            Payment.razorpay_order_id
            == payload.razorpay_order_id,
        )
        .first()
    )

    if not payment:
        raise HTTPException(
            status_code=404,
            detail="Payment order not found.",
        )

    if payment.status == "captured":
        return {
            "success": True,
            "message": "Payment already verified.",
            "request_reference": request.request_reference,
        }

    valid = verify_payment_signature(
        order_id=payload.razorpay_order_id,
        payment_id=payload.razorpay_payment_id,
        signature=payload.razorpay_signature,
    )

    if not valid:
        raise HTTPException(
            status_code=400,
            detail="Invalid payment signature.",
        )

    mark_request_payment_success(
        db=db,
        payment=payment,
        razorpay_payment_id=payload.razorpay_payment_id,
    )

    request_service.notify_request_user(
        db,
        request,
        f"""Payment received for your
{request.item_name} request
({request.request_reference}). Thank you!""",
    )

    # Personalized receipt email to the customer + alert
    # to the admin.
    send_payment_emails(payment)

    return {
        "success": True,
        "message": "Payment verified successfully.",
        "request_reference": request.request_reference,
    }


@router.post("/webhook")
async def razorpay_webhook(
    request: Request,
    db: Session = Depends(get_db),
):
    payload = await request.body()

    signature = request.headers.get(
        "X-Razorpay-Signature"
    )

    if not signature:
        raise HTTPException(
            status_code=400,
            detail="Missing webhook signature.",
        )

    if not verify_webhook_signature(
        payload,
        signature,
    ):
        raise HTTPException(
            status_code=400,
            detail="Invalid webhook signature.",
        )

    try:
        data = json.loads(payload)
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=400,
            detail="Invalid webhook payload.",
        )

    event = data.get("event")

    payment_entity = (
        data.get("payload", {})
        .get("payment", {})
        .get("entity", {})
    )

    order_id = payment_entity.get(
        "order_id"
    )

    payment_id = payment_entity.get(
        "id"
    )

    if not order_id:
        return {"status": "ignored"}

    payment = (
        db.query(Payment)
        .filter(
            Payment.razorpay_order_id
            == order_id
        )
        .first()
    )

    if not payment:
        return {"status": "ignored"}

    if event == "payment.captured":
        if payment.status != "captured":
            payment.razorpay_payment_id = payment_id
            payment.status = "captured"
            payment.paid_at = datetime.now(
                timezone.utc
            )

            if payment.request_id:
                # Webhook-confirmed request payment. Covers the
                # case where the user closes the tab before the
                # /verify call returns.
                payment.request.status = "paid"
                payment.request.expires_at = None
            else:
                payment.booking.status = "confirmed"
                payment.booking.expires_at = None

            db.commit()

            # The user closed the tab before /verify ran, so
            # this is the only chance to send the receipt and
            # alert the admin.
            send_payment_emails(payment)

    elif event == "payment.failed":
        payment.status = "failed"

        if (
            payment.booking_id
            and payment.booking.status == "pending"
        ):
            payment.booking.status = "cancelled"

        # A failed request payment leaves the request accepted,
        # so the user can retry paying within the deadline.

        db.commit()

    return {"status": "ok"}
