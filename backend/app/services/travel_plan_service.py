from datetime import date

import json

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.travel_plan import TravelPlan
from app.schemas.travel_plan import (
    CreateTravelPlanRequest,
    UpdateTravelPlanRequest,
)


def validate_dates(start_date: date, end_date: date) -> None:
    today = date.today()

    if start_date < today:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Travel plan cannot start in the past.",
        )

    if end_date <= start_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="End date must be after start date.",
        )


def _serialize_interests(interests) -> str:
    """Convert list[str] to comma-separated string for DB storage."""
    if interests is None:
        return ""
    if isinstance(interests, str):
        return interests
    return ", ".join(interests)


def _deserialize_interests(interests_str: str) -> list[str]:
    """Convert comma-separated string from DB to list[str]."""
    if not interests_str:
        return []
    return [s.strip() for s in interests_str.split(", ") if s.strip()]


def create_travel_plan(
    db: Session,
    user_id: int,
    data: CreateTravelPlanRequest,
) -> TravelPlan:

    validate_dates(data.start_date, data.end_date)

    plan = TravelPlan(
        user_id=user_id,
        title=data.title.strip(),
        destination=data.destination.strip(),
        start_date=data.start_date,
        end_date=data.end_date,
        travelers=data.travelers,
        budget=data.budget,
        travel_style=data.travel_style,
        interests=_serialize_interests(data.interests),
        itinerary=[],
        status="draft",
    )

    db.add(plan)
    db.commit()
    db.refresh(plan)

    return plan


def get_user_travel_plans(
    db: Session,
    user_id: int,
) -> list[TravelPlan]:

    return (
        db.query(TravelPlan)
        .filter(TravelPlan.user_id == user_id)
        .order_by(TravelPlan.created_at.desc())
        .all()
    )


def get_travel_plan(
    db: Session,
    user_id: int,
    plan_id: int,
) -> TravelPlan:

    plan = (
        db.query(TravelPlan)
        .filter(
            TravelPlan.id == plan_id,
            TravelPlan.user_id == user_id,
        )
        .first()
    )

    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Travel plan not found.",
        )

    # Deserialize interests for the response
    plan.interests = _deserialize_interests(plan.interests) if plan.interests else []
    return plan


def update_travel_plan(
    db: Session,
    user_id: int,
    plan_id: int,
    data: UpdateTravelPlanRequest,
) -> TravelPlan:

    plan = get_travel_plan(db, user_id, plan_id)

    update_data = data.model_dump(exclude_unset=True)

    new_start_date = update_data.get(
        "start_date",
        plan.start_date,
    )

    new_end_date = update_data.get(
        "end_date",
        plan.end_date,
    )

    validate_dates(new_start_date, new_end_date)

    for field, value in update_data.items():
        if field == "title" and value is not None:
            value = value.strip()

        if field == "destination" and value is not None:
            value = value.strip()

        if field == "travel_style" and value is not None:
            value = value.strip()

        if field == "itinerary" and value is not None:
            value = value if isinstance(value, str) else json.dumps(value)

        if field == "interests" and value is not None:
            value = _serialize_interests(value)

        setattr(plan, field, value)

    db.commit()
    db.refresh(plan)

    # Deserialize interests for the response
    plan.interests = _deserialize_interests(plan.interests) if plan.interests else []
    return plan


def delete_travel_plan(
    db: Session,
    user_id: int,
    plan_id: int,
) -> None:

    plan = get_travel_plan(db, user_id, plan_id)

    db.delete(plan)
    db.commit()