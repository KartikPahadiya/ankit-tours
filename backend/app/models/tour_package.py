from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Integer, Numeric, String, Text
from sqlalchemy.types import JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class TourPackage(Base):
    """A safari/tour package shown on the public website."""

    __tablename__ = "tour_packages"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    title: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    duration: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    price: Mapped[float] = mapped_column(
        Numeric(12, 2),
        nullable=False,
    )

    # "perPerson" or "total"
    price_type: Mapped[str] = mapped_column(
        String(20),
        default="perPerson",
        nullable=False,
    )

    # List of strings, e.g. ["1 Jeep Safari", "Breakfast daily"]
    includes: Mapped[list] = mapped_column(
        JSON,
        default=list,
        nullable=False,
    )

    # Emoji icon shown on the card
    icon: Mapped[str] = mapped_column(
        String(20),
        default="🐅",
        nullable=False,
    )

    # Theme color key: orange / red / amber / emerald / blue / purple
    color: Mapped[str] = mapped_column(
        String(20),
        default="orange",
        nullable=False,
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
