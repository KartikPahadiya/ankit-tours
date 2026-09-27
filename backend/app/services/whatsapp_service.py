import requests

from app.core.config import settings


def send_whatsapp_template(
    recipient: str,
    template_name: str,
    parameters: list[str],
) -> str:
    """
    Send a WhatsApp template message using
    the WhatsApp Business Cloud API.
    """

    if not settings.WHATSAPP_ENABLED:
        raise RuntimeError("WhatsApp notifications are disabled.")

    if not settings.WHATSAPP_ACCESS_TOKEN:
        raise RuntimeError(
            "WhatsApp access token is not configured."
        )

    if not settings.WHATSAPP_PHONE_NUMBER_ID:
        raise RuntimeError(
            "WhatsApp phone number ID is not configured."
        )

    url = (
        f"https://graph.facebook.com/"
        f"{settings.WHATSAPP_API_VERSION}/"
        f"{settings.WHATSAPP_PHONE_NUMBER_ID}/messages"
    )

    headers = {
        "Authorization": (
            f"Bearer {settings.WHATSAPP_ACCESS_TOKEN}"
        ),
        "Content-Type": "application/json",
    }

    components = []

    if parameters:
        components.append(
            {
                "type": "body",
                "parameters": [
                    {
                        "type": "text",
                        "text": str(value),
                    }
                    for value in parameters
                ],
            }
        )

    payload = {
        "messaging_product": "whatsapp",
        "to": recipient,
        "type": "template",
        "template": {
            "name": template_name,
            "language": {
                "code": settings.WHATSAPP_TEMPLATE_LANGUAGE
            },
        },
    }

    if components:
        payload["template"]["components"] = components

    response = requests.post(
        url,
        headers=headers,
        json=payload,
        timeout=15,
    )

    response.raise_for_status()

    data = response.json()

    messages = data.get("messages", [])

    if not messages:
        raise RuntimeError(
            "WhatsApp API did not return a message ID."
        )

    return messages[0]["id"]