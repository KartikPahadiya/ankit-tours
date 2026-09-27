from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class CustomPlanResponse(BaseModel):
    id: int
    user_id: int
    travel_days: int
    safari_type: str
    safari_date: str | None
    safari_shift: str
    hotel_category: str
    pickup: bool
    village: bool
    photography: bool
    food: bool
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AdminCustomPlanResponse(BaseModel):
    id: int
    user_id: int
    user_name: str | None = None
    user_email: str | None = None
    user_phone: str | None = None
    travel_days: int
    safari_type: str
    safari_date: str | None
    safari_shift: str
    hotel_category: str
    pickup: bool
    village: bool
    photography: bool
    food: bool
    status: str
    created_at: datetime


class CreateCustomPlanRequest(BaseModel):
    travel_days: int = Field(ge=1, le=30)
    safari_type: str = Field(min_length=2, max_length=30)
    safari_date: str | None = Field(default=None, max_length=50)
    safari_shift: str = Field(default="Any", max_length=30)
    hotel_category: str = Field(default="Standard", max_length=30)
    pickup: bool = False
    village: bool = False
    photography: bool = False
    food: bool = False


class UpdateCustomPlanStatusRequest(BaseModel):
    status: str = Field(min_length=2, max_length=20)
