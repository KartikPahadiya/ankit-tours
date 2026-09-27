from datetime import date, datetime

from pydantic import BaseModel


class AvailabilityRequest(BaseModel):
    room_id: int
    check_in: date
    check_out: date
    guests: int = 1


class AvailabilityResponse(BaseModel):
    available: bool
    room_id: int
    check_in: date
    check_out: date
    guests: int
    nights: int
    price_per_night: float
    total_amount: float
    available_rooms: int


class CreateBookingRequest(BaseModel):
    room_id: int
    check_in: date
    check_out: date
    guests: int = 1


class BookingResponse(BaseModel):
    id: int
    booking_reference: str

    room_id: int

    check_in: date
    check_out: date

    guests: int

    total_amount: float

    status: str

    expires_at: datetime | None

    created_at: datetime

    # Payment status joined for the My Bookings list
    payment_status: str | None = None

    model_config = {
        "from_attributes": True
    }


class BookingDetailResponse(BaseModel):
    id: int
    booking_reference: str

    room_id: int
    room_name: str

    stay_id: int
    stay_name: str
    stay_slug: str

    check_in: date
    check_out: date

    guests: int

    price_per_night: float
    total_amount: float

    status: str

    expires_at: datetime | None

    created_at: datetime

    payment_status: str | None
    razorpay_payment_id: str | None


class CancellationResponse(BaseModel):
    booking_reference: str

    booking_status: str

    payment_status: str | None

    original_amount: float

    refund_percentage: int

    refund_amount: float

    refund_id: str | None