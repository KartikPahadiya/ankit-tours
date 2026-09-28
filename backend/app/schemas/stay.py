from pydantic import BaseModel, Field


class StayImageResponse(BaseModel):
    id: int
    room_id: int | None
    image_url: str
    is_primary: bool
    display_order: int

    model_config = {
        "from_attributes": True,
    }


class RoomResponse(BaseModel):
    id: int
    name: str
    description: str | None
    max_guests: int
    price_per_night: float
    total_rooms: int

    model_config = {
        "from_attributes": True,
    }


class StayListResponse(BaseModel):
    id: int
    name: str
    slug: str
    property_type: str
    city: str
    state: str | None
    country: str
    rating: float
    review_count: int
    status: str
    primary_image: str | None = None

    model_config = {
        "from_attributes": True,
    }


class StayDetailResponse(BaseModel):
    id: int
    name: str
    slug: str
    description: str | None
    property_type: str
    city: str
    state: str | None
    country: str
    address: str | None
    latitude: float | None
    longitude: float | None
    rating: float
    review_count: int
    status: str

    images: list[StayImageResponse]
    rooms: list[RoomResponse]

    model_config = {
        "from_attributes": True,
    }
