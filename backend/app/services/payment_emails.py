"""Payment confirmation emails.

Sent the moment a Razorpay payment is captured (via the
/verify call or the webhook, whichever happens first):

1. A personalized receipt-style email to the customer.
2. An alert email to the admin (ADMIN_EMAIL in .env) so Ankit
   knows money arrived without having to open the panel.

Everything here is best-effort: an SMTP outage must never
break the payment flow, so all failures are swallowed and
simply logged.
"""

import logging

from app.core.config import settings
from app.models.payment import Payment
from app.services.email_service import send_email

logger = logging.getLogger(__name__)


def _first_name(name: str | None) -> str:
    return (name or "").strip().split(" ")[0] or "traveller"


def _receipt_html(
    *,
    name: str,
    item_name: str,
    reference: str,
    amount: float,
) -> str:
    first = _first_name(name)

    return f"""
    <div style="margin:0;padding:24px;background:#f4f4f5;
                font-family:Arial,Helvetica,sans-serif;">
      <div style="max-width:480px;margin:0 auto;background:#ffffff;
                  border-radius:12px;overflow:hidden;
                  border:1px solid #e4e4e7;">
        <div style="background:#0f172a;padding:20px 24px;">
          <p style="margin:0;color:#ffffff;font-size:18px;
                    font-weight:bold;">Ankit Tours</p>
          <p style="margin:4px 0 0;color:#a1a1aa;font-size:12px;">
            Ranthambore · Sawai Madhopur
          </p>
        </div>
        <div style="padding:24px;">
          <p style="margin:0 0 8px;font-size:16px;color:#18181b;">
            Hi {first},
          </p>
          <p style="margin:0 0 16px;font-size:14px;color:#3f3f46;
                    line-height:1.6;">
            Your payment was received successfully. Your booking
            is confirmed — see you in Ranthambore!
          </p>
          <table style="width:100%;border-collapse:collapse;
                        font-size:14px;color:#18181b;">
            <tr>
              <td style="padding:8px 0;color:#71717a;">Booking</td>
              <td style="padding:8px 0;text-align:right;
                         font-weight:bold;">{item_name}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#71717a;">Reference</td>
              <td style="padding:8px 0;text-align:right;
                         font-weight:bold;">{reference}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#71717a;
                         border-top:1px solid #e4e4e7;">
                Amount paid
              </td>
              <td style="padding:8px 0;text-align:right;
                         font-weight:bold;color:#16a34a;
                         border-top:1px solid #e4e4e7;">
                ₹{amount:,.2f}
              </td>
            </tr>
          </table>
          <p style="margin:16px 0 0;font-size:13px;color:#71717a;
                    line-height:1.6;">
            Keep this email as your receipt. If anything changes,
            just message Ankit on WhatsApp and he'll take care of
            it.
          </p>
        </div>
      </div>
      <p style="max-width:480px;margin:12px auto 0;text-align:center;
                font-size:11px;color:#a1a1aa;">
        Ankit Tours · Sawai Madhopur, Rajasthan
      </p>
    </div>
    """


def send_payment_confirmation_email(payment: Payment) -> None:
    """Personalized receipt email to the customer.

    Works for both payment kinds: instant stay bookings
    (payment.booking) and admin-approved requests
    (payment.request).
    """

    try:
        if payment.request_id:
            target = payment.request
            reference = target.request_reference
            item_name = target.item_name
            user = target.user
        else:
            booking = payment.booking
            reference = booking.booking_reference
            room = booking.room
            stay_name = (
                room.stay.name if room and room.stay else "Stay"
            )
            item_name = (
                f"{stay_name} · "
                f"{booking.check_in} → {booking.check_out}"
            )
            user = booking.user

        if not user or not user.email:
            return

        amount = float(payment.amount)

        send_email(
            recipient=user.email,
            subject=(
                f"Payment confirmed - {reference} | Ankit Tours"
            ),
            html_content=_receipt_html(
                name=user.name,
                item_name=item_name,
                reference=reference,
                amount=amount,
            ),
        )
    except Exception:
        logger.exception(
            "Failed to send payment confirmation email"
        )


def send_admin_payment_alert(payment: Payment) -> None:
    """Tell the admin that money arrived, straight to his inbox.

    Sent only when ADMIN_EMAIL is set in .env — otherwise it
    silently does nothing.
    """

    if not settings.ADMIN_EMAIL:
        return

    try:
        if payment.request_id:
            target = payment.request
            reference = target.request_reference
            item_name = target.item_name
            user = target.user
        else:
            booking = payment.booking
            reference = booking.booking_reference
            room = booking.room
            stay_name = (
                room.stay.name if room and room.stay else "Stay"
            )
            item_name = (
                f"{stay_name} · "
                f"{booking.check_in} → {booking.check_out}"
            )
            user = booking.user

        amount = float(payment.amount)
        paid_at = payment.paid_at

        customer = user.name if user else "Unknown"
        phone = (user.phone or "") if user else ""
        email = (user.email or "") if user else ""

        send_email(
            recipient=settings.ADMIN_EMAIL,
            subject=(
                f"₹{amount:,.0f} received - {reference}"
            ),
            html_content=f"""
            <div style="font-family:Arial,sans-serif;
                        font-size:14px;color:#18181b;
                        line-height:1.6;">
              <p style="font-size:16px;font-weight:bold;">
                Payment received via Razorpay
              </p>
              <p>
                <strong>₹{amount:,.2f}</strong> for
                <strong>{item_name}</strong>
                ({reference})
              </p>
              <p>
                Customer: {customer}<br/>
                Phone: {phone or "—"}<br/>
                Email: {email or "—"}<br/>
                Paid at: {paid_at}
              </p>
              <p style="color:#71717a;">
                This booking is already marked as paid in the
                admin panel — no action needed.
              </p>
            </div>
            """,
        )
    except Exception:
        logger.exception(
            "Failed to send admin payment alert email"
        )


def send_payment_emails(payment: Payment) -> None:
    """Customer receipt + admin alert. Safe to call from both
    the /verify endpoint and the webhook — both guards check
    the payment was not already captured before calling."""

    send_payment_confirmation_email(payment)
    send_admin_payment_alert(payment)
