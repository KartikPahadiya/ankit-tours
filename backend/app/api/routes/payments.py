import json

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.booking import Booking
from app.models.payment import Payment
from app.models.user import User
from app.schemas.payment import (
    CreateOrderResponse,
    VerifyPaymentRequest,
    PaymentResponse,
)
from app.services.booking_service import create_pending_booking
from app.services.payment_service import (
    create_razorpay_order,
    mark_payment_success,
    verify_payment_signature,
    verify_webhook_signature,
)
from app.services.booking_notifications import (
    create_booking_confirmation_notifications,
)


router = APIRouter(
    prefix="/api/payments",
    tags=["Payments"],
)


@router.post(
    "/create-order",
    response_model=CreateOrderResponse,
)
def create_order(
    room_id: int,
    check_in: str,
    check_out: str,
    guests: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from datetime import date

    try:
        check_in_date = date.fromisoformat(check_in)
        check_out_date = date.fromisoformat(check_out)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Invalid date format.",
        )

    try:
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

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="Unable to create payment order.",
        )


@router.post("/verify")
def verify_payment(
    payload: VerifyPaymentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
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

    return {
        "success": True,
        "message": "Payment verified successfully.",
        "booking_reference": booking.booking_reference,
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

            payment.booking.status = "confirmed"
            payment.booking.expires_at = None

            db.commit()

    elif event == "payment.failed":
        payment.status = "failed"

        if payment.booking.status == "pending":
            payment.booking.status = "cancelled"

        db.commit()

    return {"status": "ok"}
