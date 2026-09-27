import smtplib
from email.message import EmailMessage

from app.core.config import settings


def send_email(
    recipient: str,
    subject: str,
    html_content: str,
) -> str:
    """
    Send an email using SMTP.

    Returns:
        A provider-style message ID.

    Raises:
        Exception if email delivery fails.
    """

    if not settings.SMTP_USERNAME or not settings.SMTP_PASSWORD:
        raise RuntimeError("SMTP credentials are not configured.")

    message = EmailMessage()

    message["From"] = settings.EMAIL_FROM or settings.SMTP_USERNAME
    message["To"] = recipient
    message["Subject"] = subject

    message.set_content(
        "Please open this email in an HTML-compatible email client."
    )

    message.add_alternative(
        html_content,
        subtype="html",
    )

    with smtplib.SMTP(
        settings.SMTP_HOST,
        settings.SMTP_PORT,
    ) as server:
        server.starttls()

        server.login(
            settings.SMTP_USERNAME,
            settings.SMTP_PASSWORD,
        )

        server.send_message(message)

    return f"smtp-{recipient}"