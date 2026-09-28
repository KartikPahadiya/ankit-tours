from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, Field


RequestType = Literal["stay", "safari", "package", "custom"]

REQUESTED = "requested"
ACCEPTED = "accepted"
REJECTED = "rejected"
EXPIRED = "expired"
PAID = "paid"


class CreateBookingRequestRequest(BaseModel):
    type: RequestType
    item_id: int
    check_in: date | None = None
    check_out: date | None = None
    rooms: int = Field(default=1, ge=1, le=30)


class BookingRequestResponse(BaseModel):
    id: int
    request_reference: str
    type: str
    item_id: int
    item_name: str
    check_in: date | None
    check_out: date | None
    rooms: int
    status: str
    amount: float | None
    admin_note: str | None
    expires_at: datetime | None
    created_at: datetime


class AdminBookingRequestResponse(BookingRequestResponse):
    user_name: str | None
    user_email: str | None
    user_phone: str | None


class AcceptRequest(BaseModel):
    # Optional here: the admin may accept now and set the
    # amount later from the same panel.
    amount: float | None = Field(default=None, gt=0)
    note: str | None = Field(default=None, max_length=500)


class RejectRequest(BaseModel):
    note: str | None = Field(default=None, max_length=500)


class SetAmountRequest(BaseModel):
    amount: float = Field(gt=0)
    note: str | None = Field(default=None, max_length=500)


class MarkPaidRequest(BaseModel):
    amount: float = Field(gt=0)
    note: str | None = Field(default=None, max_length=500)
