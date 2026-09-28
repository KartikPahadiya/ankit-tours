from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_admin, get_current_user
from app.models.booking_request import BookingRequest
from app.models.custom_plan import CustomPlan
from app.models.user import User
from app.schemas.custom_plan import (
    AdminCustomPlanResponse,
    CreateCustomPlanRequest,
    CustomPlanResponse,
    UpdateCustomPlanStatusRequest,
)
from app.services import request_service

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
    """Save a custom package request. A matching booking request is
    created so the admin can accept it and set the price; the user
    then pays from My Bookings, and the details also go to the admin
    on WhatsApp."""
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

    # Custom packages have no listed price, so this request starts
    # with amount=None until the admin accepts it with a price.
    request_service.create_request(
        db=db,
        user=current_user,
        request_type="custom",
        item_id=plan.id,
        check_in=None,
        check_out=None,
        rooms=1,
    )

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
    admin: User = Depends(get_current_admin),
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

    if data.status == "requested":
        # Reset both rows back to pending.
        plan.status = "requested"

        db.query(BookingRequest).filter(
            BookingRequest.type == "custom",
            BookingRequest.item_id == plan.id,
        ).update(
            {
                "status": "requested",
                "expires_at": None,
                "decided_by": None,
                "decided_at": None,
            }
        )
    else:
        # Route through the booking-request flow so accepting
        # here behaves exactly like accepting from the Bookings
        # panel — linked request, customer notification and all.
        request = (
            db.query(BookingRequest)
            .filter(
                BookingRequest.type == "custom",
                BookingRequest.item_id == plan.id,
            )
            .order_by(desc(BookingRequest.id))
            .first()
        )

        if not request:
            raise HTTPException(
                status_code=404,
                detail="No booking request linked to this plan",
            )

        try:
            if data.status == "accepted":
                request_service.accept_request(
                    db, request, admin, None, None
                )
            else:
                request_service.reject_request(
                    db, request, admin, None
                )
        except ValueError as exc:
            raise HTTPException(
                status_code=409,
                detail=str(exc),
            )

        db.refresh(plan)

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
