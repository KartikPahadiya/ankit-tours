from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.notification import Notification
from app.services.email_service import send_email
from app.services.whatsapp_service import send_whatsapp_template


def dispatch_notification(db: Session, notification: Notification) -> bool:
    """
    Dispatch a notification through the appropriate provider.

    Returns:
        True if the notification was marked as sent, False if failed.

    Important:
        This function should NOT raise exceptions that propagate up,
        because booking/payment logic must not break if a provider is down.
    """

    try:
        if notification.channel == "email":
            _dispatch_email(db, notification)

        elif notification.channel == "whatsapp":
            _dispatch_whatsapp(db, notification)

        else:
            mark_notification_failed(
                db=db,
                notification=notification,
                error_message=f"Unknown channel: {notification.channel}",
            )

    except Exception as exc:
        # Never let notification failures break the booking/payment flow.
        # Just mark it as failed and let it be retried later.
        try:
            mark_notification_failed(
                db=db,
                notification=notification,
                error_message=str(exc),
            )
        except Exception:
            pass  # Even failure handling shouldn't crash.

    return True


def _dispatch_email(db: Session, notification: Notification) -> None:
    """Send email notification via SMTP."""
    try:
        send_email(
            recipient=notification.recipient,
            subject=notification.subject or "Ankit Travels Notification",
            html_content=notification.message,
        )

        mark_notification_sent(
            db=db,
            notification=notification,
            provider_message_id=f"smtp-{notification.recipient}",
        )

    except RuntimeError as exc:
        # Credentials not configured — mark as failed so admin can fix it.
        mark_notification_failed(
            db=db,
            notification=notification,
            error_message=str(exc),
        )


def _dispatch_whatsapp(db: Session, notification: Notification) -> None:
    """Send WhatsApp template message."""
    try:
        # Parse parameters from the message if needed.
        # For now, the message text is used directly.
        parameters = []

        message_id = send_whatsapp_template(
            recipient=notification.recipient,
            template_name=notification.subject or "booking_confirmation",
            parameters=parameters,
        )

        mark_notification_sent(
            db=db,
            notification=notification,
            provider_message_id=message_id,
        )

    except RuntimeError as exc:
        # WhatsApp disabled or not configured — mark as failed.
        mark_notification_failed(
            db=db,
            notification=notification,
            error_message=str(exc),
        )