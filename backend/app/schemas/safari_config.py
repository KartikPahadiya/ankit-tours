from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class SafariConfigResponse(BaseModel):
    id: int
    vehicle_type: str
    shift: str
    price_per_person: float
    seats_per_vehicle: int
    timing: str | None
    note: str | None
    is_active: bool
    display_order: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CreateSafariConfigRequest(BaseModel):
    # "Gypsy" or "Canter"
    vehicle_type: str = Field(min_length=2, max_length=30)
    # "Morning" or "Afternoon"
    shift: str = Field(min_length=2, max_length=30)
    price_per_person: float = Field(gt=0)
    seats_per_vehicle: int = Field(default=6, ge=1)
    timing: str | None = Field(default=None, max_length=100)
    note: str | None = None


class UpdateSafariConfigRequest(BaseModel):
    vehicle_type: str | None = Field(default=None, min_length=2, max_length=30)
    shift: str | None = Field(default=None, min_length=2, max_length=30)
    price_per_person: float | None = Field(default=None, gt=0)
    seats_per_vehicle: int | None = Field(default=None, ge=1)
    timing: str | None = Field(default=None, max_length=100)
    note: str | None = None
    is_active: bool | None = None
    display_order: int | None = None
