from datetime import date, datetime, timezone

from sqlalchemy import Date, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class TravelPlan(Base):
    __tablename__ = "travel_plans"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    title: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )

    destination: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )

    start_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    end_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    travelers: Mapped[int] = mapped_column(
        Integer,
        default=1,
        nullable=False,
    )

    budget: Mapped[float | None] = mapped_column(
        Numeric(12, 2),
        nullable=True,
    )

    travel_style: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    interests: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    itinerary: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    status: Mapped[str] = mapped_column(
        String(30),
        default="draft",
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

    user = relationship(
        "User",
        back_populates="travel_plans",
    )
