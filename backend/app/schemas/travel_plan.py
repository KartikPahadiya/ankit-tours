from datetime import date, datetime
from pydantic import BaseModel, Field


class CreateTravelPlanRequest(BaseModel):
    title: str = Field(min_length=2, max_length=150)
    destination: str = Field(min_length=2, max_length=150)
    start_date: date
    end_date: date
    travelers: int = Field(default=1, ge=1, le=50)
    budget: float = Field(default=0, ge=0)
    travel_style: str = Field(default="balanced", max_length=50)
    interests: list[str] = Field(default_factory=list)


class UpdateTravelPlanRequest(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=150)
    destination: str | None = Field(default=None, min_length=2, max_length=150)
    start_date: date | None = None
    end_date: date | None = None
    travelers: int | None = Field(default=None, ge=1, le=50)
    budget: float | None = Field(default=None, ge=0)
    travel_style: str | None = Field(default=None, max_length=50)
    interests: list[str] | None = None
    itinerary: list[dict] | None = None
    status: str | None = None


class TravelPlanResponse(BaseModel):
    id: int
    user_id: int
    title: str
    destination: str
    start_date: date
    end_date: date
    travelers: int
    budget: float
    travel_style: str
    interests: list[str]
    itinerary: list[dict]
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }