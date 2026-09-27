from sqlalchemy.orm import Session

from app.models.booking import Booking
from app.models.user import User

from app.services.notification_service import (
    create_notification,
)
from app.services.notification_dispatcher import dispatch_notification


def create_booking_confirmation_notifications(
    db: Session,
    user: User,
    booking: Booking,
):
    message = f"""
Booking confirmed!

Booking reference:
{booking.booking_reference}

Check-in:
{booking.check_in}

Check-out:
{booking.check_out}

Guests:
{booking.guests}

Total amount:
₹{float(booking.total_amount):,.2f}

Thank you for booking with Ankit Travels.
""".strip()

    # Create email notification
    if user.email:
        email_notif = create_notification(
            db=db,
            user=user,
            booking=booking,
            channel="email",
            event="booking_confirmed",
            recipient=user.email,
            subject=f"Booking confirmed - {booking.booking_reference}",
            message=message,
        )

        # Dispatch the email
        dispatch_notification(db=db, notification=email_notif)

    # Create WhatsApp notification
    if user.phone:
        whatsapp_notif = create_notification(
            db=db,
            user=user,
            booking=booking,
            channel="whatsapp",
            event="booking_confirmed",
            recipient=user.phone,
            message=message,
        )

        # Dispatch the WhatsApp message
        dispatch_notification(db=db, notification=whatsapp_notif)