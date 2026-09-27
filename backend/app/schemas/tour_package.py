from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class TourPackageResponse(BaseModel):
    id: int
    title: str
    duration: str
    description: str | None
    price: float
    price_type: str
    includes: list[str]
    icon: str
    color: str
    is_active: bool
    display_order: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CreateTourPackageRequest(BaseModel):
    title: str = Field(min_length=2, max_length=150)
    duration: str = Field(min_length=1, max_length=50)
    description: str | None = None
    price: float = Field(gt=0)
    price_type: str = "perPerson"
    includes: list[str] = Field(default_factory=list)
    icon: str = "🐅"
    color: str = "orange"


class UpdateTourPackageRequest(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=150)
    duration: str | None = Field(default=None, min_length=1, max_length=50)
    description: str | None = None
    price: float | None = Field(default=None, gt=0)
    price_type: str | None = None
    includes: list[str] | None = None
    icon: str | None = None
    color: str | None = None
    is_active: bool | None = None
    display_order: int | None = None
