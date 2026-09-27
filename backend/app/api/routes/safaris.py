from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_admin
from app.models.safari_config import SafariConfig
from app.models.user import User
from app.schemas.safari_config import (
    CreateSafariConfigRequest,
    SafariConfigResponse,
    UpdateSafariConfigRequest,
)

router = APIRouter(tags=["Safaris"])


# -------------------------
# Public (website content)
# -------------------------

@router.get(
    "/api/safaris",
    response_model=list[SafariConfigResponse],
)
def get_public_safaris(
    db: Session = Depends(get_db),
):
    """Active safari options (vehicle type + shift) shown on the website."""
    return (
        db.query(SafariConfig)
        .filter(SafariConfig.is_active.is_(True))
        .order_by(SafariConfig.display_order, SafariConfig.id)
        .all()
    )


# -------------------------
# Admin management
# -------------------------

@router.get(
    "/api/admin/safaris",
    response_model=list[SafariConfigResponse],
)
def get_admin_safaris(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    return (
        db.query(SafariConfig)
        .order_by(SafariConfig.display_order, SafariConfig.id)
        .all()
    )


@router.post(
    "/api/admin/safaris",
    response_model=SafariConfigResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_safari(
    data: CreateSafariConfigRequest,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    max_order = (
        db.query(func.max(SafariConfig.display_order)).scalar()
        or 0
    )

    safari = SafariConfig(
        **data.model_dump(),
        display_order=max_order + 1,
    )

    db.add(safari)
    db.commit()
    db.refresh(safari)

    return safari


@router.patch(
    "/api/admin/safaris/{safari_id}",
    response_model=SafariConfigResponse,
)
def update_safari(
    safari_id: int,
    data: UpdateSafariConfigRequest,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    safari = (
        db.query(SafariConfig)
        .filter(SafariConfig.id == safari_id)
        .first()
    )

    if not safari:
        raise HTTPException(
            status_code=404,
            detail="Safari option not found",
        )

    update_data = data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(safari, field, value)

    db.commit()
    db.refresh(safari)

    return safari


@router.delete("/api/admin/safaris/{safari_id}")
def delete_safari(
    safari_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    safari = (
        db.query(SafariConfig)
        .filter(SafariConfig.id == safari_id)
        .first()
    )

    if not safari:
        raise HTTPException(
            status_code=404,
            detail="Safari option not found",
        )

    db.delete(safari)
    db.commit()

    return {"message": "Safari option deleted successfully"}
