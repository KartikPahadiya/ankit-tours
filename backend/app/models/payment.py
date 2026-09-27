from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    booking_id: Mapped[int] = mapped_column(
        ForeignKey("bookings.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )

    razorpay_order_id: Mapped[str | None] = mapped_column(
        String(100),
        unique=True,
        nullable=True,
        index=True,
    )

    razorpay_payment_id: Mapped[str | None] = mapped_column(
        String(100),
        unique=True,
        nullable=True,
        index=True,
    )

    razorpay_refund_id: Mapped[str | None] = mapped_column(
        String(100),
        unique=True,
        nullable=True,
        index=True,
    )

    amount: Mapped[float] = mapped_column(
        Numeric(12, 2),
        nullable=False,
    )

    refunded_amount: Mapped[float] = mapped_column(
        Numeric(12, 2),
        default=0,
        nullable=False,
    )

    currency: Mapped[str] = mapped_column(
        String(10),
        default="INR",
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(30),
        default="created",
        nullable=False,
        index=True,
    )

    paid_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    refunded_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        nullable=False,
    )

    booking = relationship(
        "Booking",
        back_populates="payment",
    )