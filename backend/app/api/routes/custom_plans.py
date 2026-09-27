from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_admin, get_current_user
from app.models.custom_plan import CustomPlan
from app.models.user import User
from app.schemas.custom_plan import (
    AdminCustomPlanResponse,
    CreateCustomPlanRequest,
    CustomPlanResponse,
    UpdateCustomPlanStatusRequest,
)

router = APIRouter(tags=["Custom Plans"])

ALLOWED_STATUSES = {"requested", "accepted", "rejected"}


@router.post(
    "/api/custom-plans",
    response_model=CustomPlanResponse,
    status_code=201,
)
def create_custom_plan(
    data: CreateCustomPlanRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Save a custom package request. It is tracked in the user's
    My Bookings while the details also go to the admin on WhatsApp."""
    plan = CustomPlan(
        user_id=current_user.id,
        travel_days=data.travel_days,
        safari_type=data.safari_type,
        safari_date=data.safari_date,
        safari_shift=data.safari_shift,
        hotel_category=data.hotel_category,
        pickup=data.pickup,
        village=data.village,
        photography=data.photography,
        food=data.food,
        status="requested",
    )

    db.add(plan)
    db.commit()
    db.refresh(plan)

    return plan


@router.get(
    "/api/custom-plans/my",
    response_model=list[CustomPlanResponse],
)
def my_custom_plans(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(CustomPlan)
        .filter(CustomPlan.user_id == current_user.id)
        .order_by(desc(CustomPlan.created_at))
        .all()
    )


@router.get(
    "/api/admin/custom-plans",
    response_model=list[AdminCustomPlanResponse],
)
def all_custom_plans(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    plans = (
        db.query(CustomPlan)
        .order_by(desc(CustomPlan.created_at))
        .all()
    )

    result = []

    for plan in plans:
        user = plan.user

        result.append(
            {
                "id": plan.id,
                "user_id": plan.user_id,
                "user_name": user.name if user else None,
                "user_email": user.email if user else None,
                "user_phone": user.phone if user else None,
                "travel_days": plan.travel_days,
                "safari_type": plan.safari_type,
                "safari_date": plan.safari_date,
                "safari_shift": plan.safari_shift,
                "hotel_category": plan.hotel_category,
                "pickup": plan.pickup,
                "village": plan.village,
                "photography": plan.photography,
                "food": plan.food,
                "status": plan.status,
                "created_at": plan.created_at,
            }
        )

    return result


@router.patch(
    "/api/admin/custom-plans/{plan_id}",
    response_model=AdminCustomPlanResponse,
)
def update_custom_plan_status(
    plan_id: int,
    data: UpdateCustomPlanStatusRequest,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    """Admin accepts or rejects a custom plan request. The user sees
    the new status in their My Bookings page."""
    plan = (
        db.query(CustomPlan)
        .filter(CustomPlan.id == plan_id)
        .first()
    )

    if not plan:
        raise HTTPException(
            status_code=404,
            detail="Custom plan not found",
        )

    if data.status not in ALLOWED_STATUSES:
        raise HTTPException(
            status_code=400,
            detail="Status must be requested, accepted or rejected",
        )

    plan.status = data.status

    db.commit()
    db.refresh(plan)

    user = plan.user

    return AdminCustomPlanResponse(
        id=plan.id,
        user_id=plan.user_id,
        user_name=user.name if user else None,
        user_email=user.email if user else None,
        user_phone=user.phone if user else None,
        travel_days=plan.travel_days,
        safari_type=plan.safari_type,
        safari_date=plan.safari_date,
        safari_shift=plan.safari_shift,
        hotel_category=plan.hotel_category,
        pickup=plan.pickup,
        village=plan.village,
        photography=plan.photography,
        food=plan.food,
        status=plan.status,
        created_at=plan.created_at,
    )
