import hashlib
import hmac
from datetime import datetime, timezone

import razorpay
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.booking import Booking
from app.models.payment import Payment


razorpay_client = razorpay.Client(
    auth=(
        settings.RAZORPAY_KEY_ID,
        settings.RAZORPAY_KEY_SECRET,
    )
)


def create_razorpay_order(
    db: Session,
    booking: Booking,
) -> Payment:

    amount_in_paise = int(
        round(float(booking.total_amount) * 100)
    )

    razorpay_order = razorpay_client.order.create(
        {
            "amount": amount_in_paise,
            "currency": "INR",
            "receipt": booking.booking_reference,
            "notes": {
                "booking_id": str(booking.id),
                "booking_reference": booking.booking_reference,
            },
        }
    )

    payment = Payment(
        booking_id=booking.id,
        razorpay_order_id=razorpay_order["id"],
        amount=booking.total_amount,
        currency="INR",
        status="created",
    )

    db.add(payment)
    db.commit()
    db.refresh(payment)

    return payment


def verify_payment_signature(
    order_id: str,
    payment_id: str,
    signature: str,
) -> bool:

    message = f"{order_id}|{payment_id}"

    expected_signature = hmac.new(
        settings.RAZORPAY_KEY_SECRET.encode(),
        message.encode(),
        hashlib.sha256,
    ).hexdigest()

    return hmac.compare_digest(
        expected_signature,
        signature,
    )


def verify_webhook_signature(
    payload: bytes,
    signature: str,
) -> bool:

    expected_signature = hmac.new(
        settings.RAZORPAY_WEBHOOK_SECRET.encode(),
        payload,
        hashlib.sha256,
    ).hexdigest()

    return hmac.compare_digest(
        expected_signature,
        signature,
    )


def mark_payment_success(
    db: Session,
    payment: Payment,
    razorpay_payment_id: str,
) -> None:

    payment.razorpay_payment_id = razorpay_payment_id
    payment.status = "captured"
    payment.paid_at = datetime.now(timezone.utc)

    payment.booking.status = "confirmed"
    payment.booking.expires_at = None

    db.commit()


def create_razorpay_order_for_request(
    db: Session,
    request,
) -> Payment:
    """Create a Razorpay order (and Payment row) for an accepted
    booking request, using the admin-set amount."""

    amount_in_paise = int(
        round(float(request.amount) * 100)
    )

    razorpay_order = razorpay_client.order.create(
        {
            "amount": amount_in_paise,
            "currency": "INR",
            "receipt": request.request_reference,
            "notes": {
                "request_id": str(request.id),
                "request_reference": (
                    request.request_reference
                ),
            },
        }
    )

    payment = Payment(
        request_id=request.id,
        razorpay_order_id=razorpay_order["id"],
        amount=request.amount,
        currency="INR",
        status="created",
    )

    db.add(payment)
    db.commit()
    db.refresh(payment)

    return payment


def mark_request_payment_success(
    db: Session,
    payment: Payment,
    razorpay_payment_id: str,
) -> None:
    payment.razorpay_payment_id = razorpay_payment_id
    payment.status = "captured"
    payment.paid_at = datetime.now(timezone.utc)

    payment.request.status = "paid"
    payment.request.expires_at = None

    db.commit()


def create_refund(
    db: Session,
    payment: Payment,
    refund_amount: float,
):
    if not payment.razorpay_payment_id:
        raise ValueError(
            "No Razorpay payment found."
        )

    if payment.status not in [
        "captured",
        "partially_refunded",
    ]:
        raise ValueError(
            "This payment cannot be refunded."
        )

    if refund_amount <= 0:
        return None

    already_refunded = float(
        payment.refunded_amount or 0
    )

    remaining_amount = (
        float(payment.amount)
        - already_refunded
    )

    if refund_amount > remaining_amount:
        raise ValueError(
            "Refund amount exceeds remaining payment amount."
        )

    refund = razorpay_client.payment.refund(
        payment.razorpay_payment_id,
        {
            "amount": int(
                round(refund_amount * 100)
            ),
            "notes": {
                "booking_id": str(
                    payment.booking_id
                ),
            },
        },
    )

    payment.razorpay_refund_id = refund["id"]

    payment.refunded_amount = (
        already_refunded
        + refund_amount
    )

    if payment.refunded_amount >= payment.amount:
        payment.status = "refunded"
    else:
        payment.status = "partially_refunded"

    payment.refunded_at = datetime.now(
        timezone.utc
    )

    db.commit()
    db.refresh(payment)

    return refund
