from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.booking import Booking
from app.models.notification import Notification
from app.models.user import User


def create_notification(
    db: Session,
    user: User,
    booking: Booking | None,
    channel: str,
    event: str,
    recipient: str,
    message: str,
    subject: str | None = None,
):
    notification = Notification(
        user_id=user.id,
        booking_id=(
            booking.id
            if booking
            else None
        ),
        channel=channel,
        event=event,
        recipient=recipient,
        subject=subject,
        message=message,
        status="pending",
    )

    db.add(notification)
    db.commit()
    db.refresh(notification)

    return notification


def mark_notification_sent(
    db: Session,
    notification: Notification,
    provider_message_id: str | None = None,
):
    notification.status = "sent"

    notification.provider_message_id = (
        provider_message_id
    )

    notification.sent_at = datetime.now(
        timezone.utc
    )

    db.commit()


def mark_notification_failed(
    db: Session,
    notification: Notification,
    error_message: str,
):
    notification.status = "failed"

    notification.error_message = (
        error_message
    )

    db.commit()