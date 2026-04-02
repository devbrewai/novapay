"""Email service using Resend for escalation notifications."""

import logging
import time

import resend

from app.config import settings

logger = logging.getLogger(__name__)

# Rate limiting: one email per 60 seconds
_last_sent: float = 0.0
RATE_LIMIT_SECONDS = 60


def send_escalation_email(reason: str, user_name: str = "Alex Rivera") -> bool:
    """Send an escalation email via Resend.

    Returns True if sent, False if skipped (no API key or rate limited).
    """
    global _last_sent  # noqa: PLW0603

    if not settings.resend_api_key:
        logger.warning("RESEND_API_KEY not set — skipping email")
        return False

    now = time.time()
    if now - _last_sent < RATE_LIMIT_SECONDS:
        logger.info("Rate limited — skipping escalation email")
        return False

    resend.api_key = settings.resend_api_key

    resend.Emails.send(
        {
            "from": (f"{settings.agent_from_name} <{settings.escalation_from_email}>"),
            "to": [settings.escalation_to_email],
            "subject": f"NovaPay Escalation: {user_name}",
            "html": (
                f"<h2>Escalation Request</h2>"
                f"<p><strong>Customer:</strong> {user_name}</p>"
                f"<p><strong>Reason:</strong> {reason}</p>"
                f"<hr>"
                f"<p><em>This email was sent by Nova, "
                f"NovaPay's AI support assistant.</em></p>"
            ),
        }
    )

    _last_sent = now
    logger.info("Escalation email sent to %s", settings.escalation_to_email)
    return True
