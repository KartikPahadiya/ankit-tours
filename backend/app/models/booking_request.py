from datetime import date, datetime

from sqlalchemy import (
    Date,
    DateTime,
    ForeignKey,
    Numeric,
    String,
)
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

from app.core.database import Base


class BookingRequest(Base):
    """A unified "request to book" for stays, safaris and packages.

    Flow: requested -> accepted (admin sets amount) -> paid
          requested -> rejected (admin can attach a reason)
    Accepted requests carry a payment deadline (expires_at);
    after it passes the request reads as "expired" until the
    admin re-accepts it.
    """

    __tablename__ = "booking_requests"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    request_reference: Mapped[str] = mapped_column(
        String(30),
        unique=True,
        nullable=False,
        index=True,
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # stay / safari / package
    type: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        index=True,
    )

    # room id / safari config id / tour package id
    item_id: Mapped[int] = mapped_column(
        nullable=False,
    )

    # Snapshot of the item name at request time, so the record
    # stays meaningful even if the item is later renamed.
    item_name: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )

    check_in: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    check_out: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    rooms: Mapped[int] = mapped_column(
        default=1,
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(20),
        default="requested",
        nullable=False,
        index=True,
    )

    # Amount the admin set for this request (INR).
    amount: Mapped[float | None] = mapped_column(
        Numeric(12, 2),
        nullable=True,
    )

    # Reason for rejection / context for the customer.
    admin_note: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    # Payment deadline once accepted.
    expires_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    decided_by: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    decided_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    user = relationship(
        "User",
        foreign_keys=[user_id],
    )

    payment = relationship(
        "Payment",
        back_populates="request",
        uselist=False,
        cascade="all, delete-orphan",
    )
