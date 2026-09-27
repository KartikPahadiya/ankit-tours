from datetime import datetime, timezone

from sqlalchemy import (
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Stay(Base):
    __tablename__ = "stays"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    name: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )

    slug: Mapped[str] = mapped_column(
        String(220),
        unique=True,
        nullable=False,
        index=True,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    property_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    city: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
    )

    state: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    country: Mapped[str] = mapped_column(
        String(100),
        default="India",
        nullable=False,
    )

    address: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    latitude: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    longitude: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    rating: Mapped[float] = mapped_column(
        Float,
        default=0.0,
        nullable=False,
    )

    review_count: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(30),
        default="active",
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    rooms = relationship(
        "Room",
        back_populates="stay",
        cascade="all, delete-orphan",
    )

    images = relationship(
        "StayImage",
        back_populates="stay",
        cascade="all, delete-orphan",
    )

    reviews = relationship(
        "Review",
        back_populates="stay",
        cascade="all, delete-orphan",
    )


class StayImage(Base):
    __tablename__ = "stay_images"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    stay_id: Mapped[int] = mapped_column(
        ForeignKey("stays.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Optional: if set, this photo belongs to a specific room type
    room_id: Mapped[int | None] = mapped_column(
        ForeignKey("rooms.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )

    image_url: Mapped[str] = mapped_column(
        String(1000),
        nullable=False,
    )

    public_id: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    is_primary: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    display_order: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    stay = relationship(
        "Stay",
        back_populates="images",
    )
