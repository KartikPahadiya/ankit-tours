from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    booking_id: Mapped[int | None] = mapped_column(
        ForeignKey(
            "bookings.id",
            ondelete="SET NULL",
        ),
        nullable=True,
        index=True,
    )

    channel: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
    )

    event: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    recipient: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(30),
        default="pending",
        nullable=False,
    )

    subject: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    message: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    provider_message_id: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    error_message: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        nullable=False,
    )

    sent_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    user = relationship(
        "User",
    )

    booking = relationship(
        "Booking",
    )