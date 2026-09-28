from fastapi import APIRouter, Depends, HTTPException, Request, status, File, UploadFile
from pathlib import Path
from uuid import uuid4
import re
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_admin
from app.models.booking import Booking
from app.models.room import Room
from app.models.stay import Stay, StayImage
from app.models.user import User
from app.schemas.admin import (
    AdminBookingResponse,
    AdminRoomResponse,
    AdminStayResponse,
    AdminStayImageResponse,
    AdminUserResponse,
    CreateRoomRequest,
    CreateStayRequest,
    UpdateRoomRequest,
    UpdateStayRequest,
)

router = APIRouter(
    prefix="/api/admin",
    tags=["Admin"],
)


# -------------------------
# Dashboard
# -------------------------

@router.get("/dashboard")
def get_dashboard(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    total_users = db.query(User).count()
    total_stays = db.query(Stay).count()
    total_rooms = db.query(Room).count()
    total_bookings = db.query(Booking).count()

    confirmed_bookings = (
        db.query(Booking)
        .filter(Booking.status == "confirmed")
        .count()
    )

    pending_bookings = (
        db.query(Booking)
        .filter(Booking.status == "pending")
        .count()
    )

    revenue = (
        db.query(Booking)
        .filter(Booking.status == "confirmed")
        .with_entities(Booking.total_amount)
        .all()
    )

    total_revenue = sum(
        float(row[0])
        for row in revenue
    )

    return {
        "total_users": total_users,
        "total_stays": total_stays,
        "total_rooms": total_rooms,
        "total_bookings": total_bookings,
        "confirmed_bookings": confirmed_bookings,
        "pending_bookings": pending_bookings,
        "total_revenue": total_revenue,
    }


# -------------------------
# Stays
# -------------------------

@router.get(
    "/stays",
    response_model=list[AdminStayResponse],
)
def get_admin_stays(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    return (
        db.query(Stay)
        .order_by(Stay.created_at.desc())
        .all()
    )


@router.post(
    "/stays",
    response_model=AdminStayResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_stay(
    data: CreateStayRequest,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    requested_slug = data.slug or data.name
    base_slug = re.sub(
        r"[^a-z0-9]+",
        "-",
        requested_slug.strip().lower(),
    ).strip("-") or "property"
    clean_slug = base_slug
    suffix = 2

    while db.query(Stay).filter(Stay.slug == clean_slug).first():
        clean_slug = f"{base_slug}-{suffix}"
        suffix += 1

    stay = Stay(
        name=data.name,
        slug=clean_slug,
        description=data.description,
        property_type=data.property_type,
        city=data.city,
        state=data.state,
        country=data.country,
        address=data.address,
        latitude=data.latitude,
        longitude=data.longitude,
        rating=0,
        review_count=0,
        status="active",
    )

    db.add(stay)
    db.commit()
    db.refresh(stay)

    return stay


@router.patch(
    "/stays/{stay_id}",
    response_model=AdminStayResponse,
)
def update_stay(
    stay_id: int,
    data: UpdateStayRequest,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    stay = (
        db.query(Stay)
        .filter(Stay.id == stay_id)
        .first()
    )

    if not stay:
        raise HTTPException(
            status_code=404,
            detail="Stay not found",
        )

    update_data = data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(stay, field, value)

    db.commit()
    db.refresh(stay)

    return stay


@router.delete("/stays/{stay_id}")
def delete_stay(
    stay_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    stay = (
        db.query(Stay)
        .filter(Stay.id == stay_id)
        .first()
    )

    if not stay:
        raise HTTPException(
            status_code=404,
            detail="Stay not found",
        )

    stay.status = "inactive"

    db.commit()

    return {
        "message": "Stay deactivated successfully"
    }


# -------------------------
# Rooms
# -------------------------

@router.get(
    "/stays/{stay_id}/rooms",
    response_model=list[AdminRoomResponse],
)
def get_rooms(
    stay_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    stay = (
        db.query(Stay)
        .filter(Stay.id == stay_id)
        .first()
    )

    if not stay:
        raise HTTPException(
            status_code=404,
            detail="Stay not found",
        )

    return (
        db.query(Room)
        .filter(Room.stay_id == stay_id)
        .order_by(Room.id)
        .all()
    )


@router.post(
    "/stays/{stay_id}/rooms",
    response_model=AdminRoomResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_room(
    stay_id: int,
    data: CreateRoomRequest,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    stay = (
        db.query(Stay)
        .filter(Stay.id == stay_id)
        .first()
    )

    if not stay:
        raise HTTPException(
            status_code=404,
            detail="Stay not found",
        )

    room = Room(
        stay_id=stay_id,
        name=data.name,
        description=data.description,
        max_guests=data.max_guests,
        price_per_night=data.price_per_night,
        total_rooms=data.total_rooms,
    )

    db.add(room)
    db.commit()
    db.refresh(room)

    return room


@router.patch(
    "/rooms/{room_id}",
    response_model=AdminRoomResponse,
)
def update_room(
    room_id: int,
    data: UpdateRoomRequest,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    room = (
        db.query(Room)
        .filter(Room.id == room_id)
        .first()
    )

    if not room:
        raise HTTPException(
            status_code=404,
            detail="Room not found",
        )

    update_data = data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(room, field, value)

    db.commit()
    db.refresh(room)

    return room


@router.delete("/rooms/{room_id}")
def delete_room(
    room_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    room = db.query(Room).filter(Room.id == room_id).first()

    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    images = db.query(StayImage).filter(StayImage.room_id == room_id).all()

    for image in images:
        if image.public_id and str(image.public_id).startswith("uploads/"):
            local_path = Path(image.public_id)
            if local_path.exists():
                try:
                    local_path.unlink()
                except OSError:
                    pass

    db.delete(room)
    db.commit()

    return {"message": "Room type deleted successfully"}


# -------------------------
# Bookings
# -------------------------

@router.get(
    "/bookings",
    response_model=list[AdminBookingResponse],
)
def get_all_bookings(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    """All bookings with customer and property details,
    so the admin can see exactly who purchased what."""
    bookings = (
        db.query(Booking)
        .order_by(Booking.created_at.desc())
        .all()
    )

    result = []

    for booking in bookings:
        user = booking.user
        room = booking.room
        stay = room.stay if room else None

        result.append(
            {
                "id": booking.id,
                "booking_reference": booking.booking_reference,
                "user_id": booking.user_id,
                "room_id": booking.room_id,
                "check_in": booking.check_in,
                "check_out": booking.check_out,
                "guests": booking.guests,
                "total_amount": float(booking.total_amount),
                "status": booking.status,
                "expires_at": booking.expires_at,
                "created_at": booking.created_at,
                "customer_name": user.name if user else None,
                "customer_email": user.email if user else None,
                "customer_phone": user.phone if user else None,
                "room_name": room.name if room else None,
                "stay_name": stay.name if stay else None,
            }
        )

    return result


# -------------------------
# Users
# -------------------------

@router.get(
    "/users",
    response_model=list[AdminUserResponse],
)
def get_all_users(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    return (
        db.query(User)
        .order_by(User.created_at.desc())
        .all()
    )


# -------------------------
# Property images (stored locally - no external service)
# -------------------------

ALLOWED_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}

MAX_IMAGE_BYTES = 5 * 1024 * 1024


@router.get(
    "/stays/{stay_id}/images",
    response_model=list[AdminStayImageResponse],
)
def get_stay_images(
    stay_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    stay = (
        db.query(Stay)
        .filter(Stay.id == stay_id)
        .first()
    )

    if not stay:
        raise HTTPException(
            status_code=404,
            detail="Stay not found",
        )

    return (
        db.query(StayImage)
        .filter(StayImage.stay_id == stay_id)
        .order_by(
            StayImage.display_order,
            StayImage.id,
        )
        .all()
    )


@router.post(
    "/stays/{stay_id}/images",
    response_model=AdminStayImageResponse,
    status_code=status.HTTP_201_CREATED,
)
def upload_stay_image(
    stay_id: int,
    request: Request,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    """Upload a property photo. The file is stored on this server
    (uploads/stays/...) and served at /uploads/... — the first photo
    uploaded automatically becomes the main image on the website."""
    stay = (
        db.query(Stay)
        .filter(Stay.id == stay_id)
        .first()
    )

    if not stay:
        raise HTTPException(
            status_code=404,
            detail="Stay not found",
        )

    extension = ALLOWED_IMAGE_TYPES.get(file.content_type)

    if not extension:
        raise HTTPException(
            status_code=400,
            detail="Only JPG, PNG and WebP images are allowed.",
        )

    contents = file.file.read()

    if len(contents) > MAX_IMAGE_BYTES:
        raise HTTPException(
            status_code=400,
            detail="Image must be 5 MB or smaller.",
        )

    filename = f"{uuid4().hex}{extension}"

    folder = Path("uploads") / "stays" / str(stay_id)
    folder.mkdir(parents=True, exist_ok=True)

    (folder / filename).write_bytes(contents)

    existing_count = (
        db.query(StayImage)
        .filter(StayImage.stay_id == stay_id)
        .count()
    )

    base_url = str(request.base_url).rstrip("/")

    image = StayImage(
        stay_id=stay_id,
        image_url=f"{base_url}/uploads/stays/{stay_id}/{filename}",
        public_id=f"uploads/stays/{stay_id}/{filename}",
        is_primary=existing_count == 0,
        display_order=existing_count,
    )

    db.add(image)
    db.commit()
    db.refresh(image)

    return image


@router.delete(
    "/stays/{stay_id}/images/{image_id}"
)
def delete_stay_image(
    stay_id: int,
    image_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    image = (
        db.query(StayImage)
        .filter(
            StayImage.id == image_id,
            StayImage.stay_id == stay_id,
        )
        .first()
    )

    if not image:
        raise HTTPException(
            status_code=404,
            detail="Image not found",
        )

    public_id = image.public_id
    was_primary = image.is_primary

    db.delete(image)

    # Remove the local file for images uploaded to this server.
    if (
        public_id
        and str(public_id).startswith("uploads/stays/")
    ):
        local_path = Path(public_id)

        if local_path.exists():
            try:
                local_path.unlink()
            except OSError:
                # Database deletion should not fail just because
                # the file could not be removed.
                pass

    db.commit()

    if was_primary:
        replacement = (
            db.query(StayImage)
            .filter(StayImage.stay_id == stay_id)
            .order_by(StayImage.display_order)
            .first()
        )

        if replacement:
            replacement.is_primary = True
            db.commit()

    return {
        "message": "Image deleted successfully"
    }


@router.post(
    "/rooms/{room_id}/images",
    response_model=AdminStayImageResponse,
    status_code=status.HTTP_201_CREATED,
)
def upload_room_image(
    room_id: int,
    request: Request,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    """Upload a photo for a specific room type."""
    from app.models.room import Room

    room = (
        db.query(Room)
        .filter(Room.id == room_id)
        .first()
    )

    if not room:
        raise HTTPException(
            status_code=404,
            detail="Room not found",
        )

    extension = ALLOWED_IMAGE_TYPES.get(file.content_type)

    if not extension:
        raise HTTPException(
            status_code=400,
            detail="Only JPG, PNG and WebP images are allowed.",
        )

    contents = file.file.read()

    if len(contents) > MAX_IMAGE_BYTES:
        raise HTTPException(
            status_code=400,
            detail="Image must be 5 MB or smaller.",
        )

    filename = f"{uuid4().hex}{extension}"

    folder = Path("uploads") / "rooms" / str(room_id)
    folder.mkdir(parents=True, exist_ok=True)

    (folder / filename).write_bytes(contents)

    base_url = str(request.base_url).rstrip("/")

    image = StayImage(
        stay_id=room.stay_id,
        room_id=room_id,
        image_url=f"{base_url}/uploads/rooms/{room_id}/{filename}",
        public_id=f"uploads/rooms/{room_id}/{filename}",
        is_primary=False,
        display_order=999,
    )

    db.add(image)
    db.commit()
    db.refresh(image)

    return image


@router.delete("/stays/{stay_id}/permanent")
def delete_stay_permanent(
    stay_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    """Permanently delete a property and all its rooms, images and bookings."""
    stay = (
        db.query(Stay)
        .filter(Stay.id == stay_id)
        .first()
    )

    if not stay:
        raise HTTPException(
            status_code=404,
            detail="Stay not found",
        )

    # Remove local image files
    images = (
        db.query(StayImage)
        .filter(StayImage.stay_id == stay_id)
        .all()
    )

    for image in images:
        if image.public_id and str(image.public_id).startswith("uploads/"):
            local_path = Path(image.public_id)

            if local_path.exists():
                try:
                    local_path.unlink()
                except OSError:
                    pass

    db.delete(stay)
    db.commit()

    return {
        "message": "Property deleted successfully"
    }


