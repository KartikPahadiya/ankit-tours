import secrets
from datetime import date, datetime, timedelta, timezone

from sqlalchemy import and_, func
from sqlalchemy.orm import joinedload, Session

from app.core.config import settings
from app.models.booking import Booking
from app.models.room import Room
from app.models.user import User


ACTIVE_BOOKING_STATUSES = [
    "pending",
    "confirmed",
]


def validate_dates(
    check_in: date,
    check_out: date,
) -> None:

    today = date.today()

    if check_in >= check_out:
        raise ValueError(
            "Check-out date must be after check-in date."
        )

    if check_in < today:
        raise ValueError(
            "Check-in date cannot be in the past."
        )


def get_available_rooms(
    db: Session,
    room: Room,
    check_in: date,
    check_out: date,
) -> int:

    now = datetime.now(timezone.utc)

    overlapping_bookings = (
        db.query(func.count(Booking.id))
        .filter(
            Booking.room_id == room.id,
            Booking.status.in_(ACTIVE_BOOKING_STATUSES),

            Booking.check_in < check_out,
            Booking.check_out > check_in,

            (
                (Booking.status == "confirmed")
                |
                (
                    (Booking.status == "pending")
                    & (Booking.expires_at > now)
                )
            ),
        )
        .scalar()
    )

    overlapping_bookings = overlapping_bookings or 0

    available_rooms = (
        room.total_rooms - overlapping_bookings
    )

    return max(available_rooms, 0)


def check_availability(
    db: Session,
    room_id: int,
    check_in: date,
    check_out: date,
    guests: int,
):

    validate_dates(check_in, check_out)

    room = (
        db.query(Room)
        .filter(Room.id == room_id)
        .first()
    )

    if not room:
        raise ValueError("Room not found.")

    if guests > room.max_guests:
        raise ValueError(
            f"This room allows a maximum of "
            f"{room.max_guests} guests."
        )

    nights = (check_out - check_in).days

    available_rooms = get_available_rooms(
        db,
        room,
        check_in,
        check_out,
    )

    total_amount = (
        float(room.price_per_night) * nights
    )

    return {
        "available": available_rooms > 0,
        "room_id": room.id,
        "check_in": check_in,
        "check_out": check_out,
        "guests": guests,
        "nights": nights,
        "price_per_night": float(room.price_per_night),
        "total_amount": total_amount,
        "available_rooms": available_rooms,
    }


def create_pending_booking(
    db: Session,
    user: User,
    room_id: int,
    check_in: date,
    check_out: date,
    guests: int,
):

    validate_dates(check_in, check_out)

    # Lock the room row during the inventory check.
    room = (
        db.query(Room)
        .filter(Room.id == room_id)
        .with_for_update()
        .first()
    )

    if not room:
        raise ValueError("Room not found.")

    if guests > room.max_guests:
        raise ValueError(
            f"This room allows a maximum of "
            f"{room.max_guests} guests."
        )

    available_rooms = get_available_rooms(
        db,
        room,
        check_in,
        check_out,
    )

    if available_rooms <= 0:
        raise ValueError(
            "This room is no longer available "
            "for the selected dates."
        )

    nights = (check_out - check_in).days

    total_amount = (
        float(room.price_per_night) * nights
    )

    booking_reference = (
        "TN-"
        + secrets.token_hex(5).upper()
    )

    expires_at = (
        datetime.now(timezone.utc)
        + timedelta(
            minutes=settings.BOOKING_HOLD_MINUTES
        )
    )

    booking = Booking(
        booking_reference=booking_reference,
        user_id=user.id,
        room_id=room.id,
        check_in=check_in,
        check_out=check_out,
        guests=guests,
        total_amount=total_amount,
        status="pending",
        expires_at=expires_at,
    )

    db.add(booking)
    db.commit()
    db.refresh(booking)

    return booking


def get_user_booking(
    db: Session,
    booking_id: int,
    user_id: int,
):
    booking = (
        db.query(Booking)
        .options(
            joinedload(Booking.room)
            .joinedload(Room.stay),

            joinedload(Booking.payment),
        )
        .filter(
            Booking.id == booking_id,
            Booking.user_id == user_id,
        )
        .first()
    )

    return booking


def get_user_booking_by_reference(
    db: Session,
    booking_reference: str,
    user_id: int,
):
    booking = (
        db.query(Booking)
        .options(
            joinedload(Booking.room)
            .joinedload(Room.stay),

            joinedload(Booking.payment),
        )
        .filter(
            Booking.booking_reference == booking_reference,
            Booking.user_id == user_id,
        )
        .first()
    )

    return booking


def cancel_booking(
    db: Session,
    booking: Booking,
):
    if booking.status == "cancelled":
        raise ValueError(
            "This booking is already cancelled."
        )

    if booking.status == "completed":
        raise ValueError(
            "Completed bookings cannot be cancelled."
        )

    if booking.status not in [
        "pending",
        "confirmed",
    ]:
        raise ValueError(
            "This booking cannot be cancelled."
        )

    booking.status = "cancelled"
    booking.expires_at = None

    db.commit()
    db.refresh(booking)

    return booking