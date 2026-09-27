from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_admin
from app.models.tour_package import TourPackage
from app.models.user import User
from app.schemas.tour_package import (
    CreateTourPackageRequest,
    TourPackageResponse,
    UpdateTourPackageRequest,
)

router = APIRouter(tags=["Tour Packages"])


# -------------------------
# Public (website content)
# -------------------------

@router.get(
    "/api/packages",
    response_model=list[TourPackageResponse],
)
def get_public_packages(
    db: Session = Depends(get_db),
):
    """Active packages shown on the public Tours page."""
    return (
        db.query(TourPackage)
        .filter(TourPackage.is_active.is_(True))
        .order_by(TourPackage.display_order, TourPackage.id)
        .all()
    )


# -------------------------
# Admin management
# -------------------------

@router.get(
    "/api/admin/packages",
    response_model=list[TourPackageResponse],
)
def get_admin_packages(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    return (
        db.query(TourPackage)
        .order_by(TourPackage.display_order, TourPackage.id)
        .all()
    )


@router.post(
    "/api/admin/packages",
    response_model=TourPackageResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_package(
    data: CreateTourPackageRequest,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    max_order = (
        db.query(func.max(TourPackage.display_order)).scalar()
        or 0
    )

    package = TourPackage(
        **data.model_dump(),
        display_order=max_order + 1,
    )

    db.add(package)
    db.commit()
    db.refresh(package)

    return package


@router.patch(
    "/api/admin/packages/{package_id}",
    response_model=TourPackageResponse,
)
def update_package(
    package_id: int,
    data: UpdateTourPackageRequest,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    package = (
        db.query(TourPackage)
        .filter(TourPackage.id == package_id)
        .first()
    )

    if not package:
        raise HTTPException(
            status_code=404,
            detail="Package not found",
        )

    update_data = data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(package, field, value)

    db.commit()
    db.refresh(package)

    return package


@router.delete("/api/admin/packages/{package_id}")
def delete_package(
    package_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    package = (
        db.query(TourPackage)
        .filter(TourPackage.id == package_id)
        .first()
    )

    if not package:
        raise HTTPException(
            status_code=404,
            detail="Package not found",
        )

    db.delete(package)
    db.commit()

    return {"message": "Package deleted successfully"}
