from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.stay import (
    StayDetailResponse,
    StayListResponse,
)
from app.services.stay_service import (
    get_stay_by_slug,
    get_stays,
)


router = APIRouter(
    prefix="/api/stays",
    tags=["Stays"],
)


@router.get(
    "",
    response_model=list[StayListResponse],
)
def list_stays(
    city: str | None = Query(
        default=None,
        description="Filter by city",
    ),
    property_type: str | None = Query(
        default=None,
        description="Filter by property type",
    ),
    db: Session = Depends(get_db),
):
    stays = get_stays(
        db=db,
        city=city,
        property_type=property_type,
    )

    result = []

    for stay in stays:

        primary_image = None

        if stay.images:
            primary = next(
                (
                    image
                    for image in stay.images
                    if image.is_primary
                ),
                stay.images[0],
            )

            primary_image = primary.image_url

        result.append(
            {
                "id": stay.id,
                "name": stay.name,
                "slug": stay.slug,
                "property_type": stay.property_type,
                "city": stay.city,
                "state": stay.state,
                "country": stay.country,
                "rating": stay.rating,
                "review_count": stay.review_count,
                "status": stay.status,
                "primary_image": primary_image,
            }
        )

    return result


@router.get(
    "/{slug}",
    response_model=StayDetailResponse,
)
def get_stay(
    slug: str,
    db: Session = Depends(get_db),
):
    stay = get_stay_by_slug(
        db=db,
        slug=slug,
    )

    if not stay:
        raise HTTPException(
            status_code=404,
            detail="Stay not found",
        )

    return stay
