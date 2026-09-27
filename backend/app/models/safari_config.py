from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class SafariConfig(Base):
    """A bookable safari option: vehicle type + shift, priced by the admin."""

    __tablename__ = "safari_configs"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    # "Gypsy" or "Canter"
    vehicle_type: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
    )

    # "Morning" or "Afternoon"
    shift: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
    )

    price_per_person: Mapped[float] = mapped_column(
        Numeric(12, 2),
        nullable=False,
    )

    seats_per_vehicle: Mapped[int] = mapped_column(
        Integer,
        default=6,
        nullable=False,
    )

    # e.g. "Around 6:00 AM (varies by season)"
    timing: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    note: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    display_order: Mapped[int] = mapped_column(
        Integer,
        default=0,
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
