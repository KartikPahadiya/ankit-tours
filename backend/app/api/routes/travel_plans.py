from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.travel_plan import (
    CreateTravelPlanRequest,
    UpdateTravelPlanRequest,
    TravelPlanResponse,
)
from app.services.travel_plan_service import (
    create_travel_plan,
    get_user_travel_plans,
    get_travel_plan,
    update_travel_plan,
    delete_travel_plan,
)


router = APIRouter(
    prefix="/api/travel-plans",
    tags=["Travel Plans"],
)


@router.post(
    "",
    response_model=TravelPlanResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_plan(
    data: CreateTravelPlanRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_travel_plan(
        db=db,
        user_id=current_user.id,
        data=data,
    )


@router.get(
    "",
    response_model=list[TravelPlanResponse],
)
def list_plans(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_user_travel_plans(
        db=db,
        user_id=current_user.id,
    )


@router.get(
    "/{plan_id}",
    response_model=TravelPlanResponse,
)
def get_plan(
    plan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_travel_plan(
        db=db,
        user_id=current_user.id,
        plan_id=plan_id,
    )


@router.patch(
    "/{plan_id}",
    response_model=TravelPlanResponse,
)
def update_plan(
    plan_id: int,
    data: UpdateTravelPlanRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return update_travel_plan(
        db=db,
        user_id=current_user.id,
        plan_id=plan_id,
        data=data,
    )


@router.delete(
    "/{plan_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_plan(
    plan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    delete_travel_plan(
        db=db,
        user_id=current_user.id,
        plan_id=plan_id,
    )

    return None