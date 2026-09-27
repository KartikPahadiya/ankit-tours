from datetime import date

from sqlalchemy import (
    Date,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Room(Base):
    __tablename__ = "rooms"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    stay_id: Mapped[int] = mapped_column(
        ForeignKey("stays.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    max_guests: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    price_per_night: Mapped[float] = mapped_column(
        Numeric(12, 2),
        nullable=False,
    )

    total_rooms: Mapped[int] = mapped_column(
        Integer,
        default=1,
        nullable=False,
    )

    stay = relationship(
        "Stay",
        back_populates="rooms",
    )

    availability = relationship(
        "RoomAvailability",
        back_populates="room",
        cascade="all, delete-orphan",
    )

    bookings = relationship(
        "Booking",
        back_populates="room",
    )


class RoomAvailability(Base):
    __tablename__ = "room_availability"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    room_id: Mapped[int] = mapped_column(
        ForeignKey("rooms.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    available_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
        index=True,
    )

    available_rooms: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    room = relationship(
        "Room",
        back_populates="availability",
    )

    __table_args__ = (
        UniqueConstraint(
            "room_id",
            "available_date",
            name="uq_room_availability_date",
        ),
    )
