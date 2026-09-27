from sqlalchemy.orm import Session, joinedload

from app.models.stay import Stay


def get_stays(
    db: Session,
    city: str | None = None,
    property_type: str | None = None,
):
    query = (
        db.query(Stay)
        .options(
            joinedload(Stay.images),
        )
        .filter(
            Stay.status == "active",
        )
    )

    if city:
        query = query.filter(
            Stay.city.ilike(f"%{city}%")
        )

    if property_type:
        query = query.filter(
            Stay.property_type == property_type
        )

    return query.order_by(
        Stay.rating.desc()
    ).all()


def get_stay_by_slug(
    db: Session,
    slug: str,
):
    return (
        db.query(Stay)
        .options(
            joinedload(Stay.images),
            joinedload(Stay.rooms),
        )
        .filter(
            Stay.slug == slug,
            Stay.status == "active",
        )
        .first()
    )
