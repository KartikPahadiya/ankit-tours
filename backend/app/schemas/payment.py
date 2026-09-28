from datetime import datetime

from pydantic import BaseModel


class CreateOrderResponse(BaseModel):
    booking_id: int | None = None
    booking_reference: str | None = None

    request_id: int | None = None
    request_reference: str | None = None

    razorpay_order_id: str
    razorpay_key_id: str

    amount: float
    currency: str


class VerifyPaymentRequest(BaseModel):
    booking_id: int | None = None
    request_id: int | None = None

    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


class PaymentResponse(BaseModel):
    id: int
    booking_id: int
    razorpay_order_id: str | None
    razorpay_payment_id: str | None
    amount: float
    currency: str
    status: str
    paid_at: datetime | None

    model_config = {
        "from_attributes": True
    }
