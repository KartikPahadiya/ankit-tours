from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class AdminStayResponse(BaseModel):
    id: int
    name: str
    slug: str
    description: str | None
    property_type: str
    city: str
    state: str
    country: str
    address: str | None
    latitude: float | None
    longitude: float | None
    rating: float
    review_count: int
    status: str

    model_config = ConfigDict(from_attributes=True)


class AdminRoomResponse(BaseModel):
    id: int
    stay_id: int
    name: str
    description: str | None
    max_guests: int
    price_per_night: float
    total_rooms: int

    model_config = ConfigDict(from_attributes=True)


class CreateStayRequest(BaseModel):
    name: str = Field(min_length=2, max_length=150)
    slug: str = Field(min_length=2, max_length=180)
    description: str | None = None
    property_type: str = "Hotel"
    city: str
    state: str
    country: str = "India"
    address: str | None = None
    latitude: float | None = None
    longitude: float | None = None


class UpdateStayRequest(BaseModel):
    name: str | None = None
    description: str | None = None
    property_type: str | None = None
    city: str | None = None
    state: str | None = None
    country: str | None = None
    address: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    status: str | None = None


class CreateRoomRequest(BaseModel):
    name: str = Field(min_length=2, max_length=150)
    description: str | None = None
    max_guests: int = Field(default=2, ge=1)
    price_per_night: float = Field(gt=0)
    total_rooms: int = Field(default=1, ge=1)


class UpdateRoomRequest(BaseModel):
    name: str | None = None
    description: str | None = None
    max_guests: int | None = Field(default=None, ge=1)
    price_per_night: float | None = Field(default=None, gt=0)
    total_rooms: int | None = Field(default=None, ge=1)


class AdminBookingResponse(BaseModel):
    id: int
    booking_reference: str
    user_id: int
    room_id: int
    check_in: date
    check_out: date
    guests: int
    total_amount: float
    status: str
    expires_at: datetime | None
    created_at: datetime

    # Customer + property details (joined for the admin panel)
    customer_name: str | None = None
    customer_email: str | None = None
    customer_phone: str | None = None
    room_name: str | None = None
    stay_name: str | None = None

    model_config = ConfigDict(from_attributes=True)


class AdminUserResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: str | None
    role: str
    is_verified: bool
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AdminStayImageResponse(BaseModel):
    id: int
    stay_id: int
    room_id: int | None = None
    image_url: str
    public_id: str | None
    is_primary: bool
    display_order: int

    model_config = ConfigDict(from_attributes=True)


class AddStayImageByUrlRequest(BaseModel):
    url: str = Field(min_length=8, max_length=2048)