from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class CustomPlan(Base):
    """A custom package plan requested by a user from the website form.

    The request is also sent to the admin on WhatsApp; the admin
    accepts or rejects it from the admin panel, and the user sees
    the status in their My Bookings page.
    """

    __tablename__ = "custom_plans"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Number of travel days the user wants
    travel_days: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    # "Gypsy", "Canter" or "Not required"
    safari_type: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
    )

    # Free-text / ISO date for the preferred safari day
    safari_date: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    # "Morning", "Afternoon" or "Any"
    safari_shift: Mapped[str] = mapped_column(
        String(30),
        default="Any",
        nullable=False,
    )

    # "Budget", "Standard" or "Premium"
    hotel_category: Mapped[str] = mapped_column(
        String(30),
        default="Standard",
        nullable=False,
    )

    pickup: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    village: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    photography: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    food: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    # "requested", "accepted" or "rejected"
    status: Mapped[str] = mapped_column(
        String(20),
        default="requested",
        nullable=False,
        index=True,
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

    user = relationship(
        "User",
        back_populates="custom_plans",
    )
