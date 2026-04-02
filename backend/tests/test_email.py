"""Tests for escalation email service."""

import time
from unittest.mock import Mock, patch

import pytest

from app.config import settings
from app.services import email
from app.services.email import RATE_LIMIT_SECONDS, send_escalation_email

requires_resend = pytest.mark.skipif(
    not settings.resend_api_key,
    reason="RESEND_API_KEY not set",
)


@patch("app.services.email.resend")
def test_send_escalation_email_calls_resend(mock_resend: Mock) -> None:
    email._last_sent = 0.0

    with patch.object(settings, "resend_api_key", "test-key"):
        result = send_escalation_email("account closure")

    assert result is True
    mock_resend.Emails.send.assert_called_once()

    call_args = mock_resend.Emails.send.call_args[0][0]
    assert "account closure" in call_args["html"]
    assert "Alex Rivera" in call_args["html"]
    assert "Escalation" in call_args["subject"]


@patch("app.services.email.resend")
def test_send_escalation_email_custom_user(mock_resend: Mock) -> None:
    email._last_sent = 0.0

    with patch.object(settings, "resend_api_key", "test-key"):
        result = send_escalation_email("fraud", user_name="Jane Doe")

    assert result is True
    call_args = mock_resend.Emails.send.call_args[0][0]
    assert "Jane Doe" in call_args["html"]
    assert "Jane Doe" in call_args["subject"]


def test_send_escalation_email_skips_without_api_key() -> None:
    email._last_sent = 0.0

    with patch.object(settings, "resend_api_key", ""):
        result = send_escalation_email("test")

    assert result is False


@patch("app.services.email.resend")
def test_send_escalation_email_rate_limited(mock_resend: Mock) -> None:
    email._last_sent = time.time()

    with patch.object(settings, "resend_api_key", "test-key"):
        result = send_escalation_email("test")

    assert result is False
    mock_resend.Emails.send.assert_not_called()


@patch("app.services.email.resend")
def test_send_escalation_email_after_rate_limit_expires(
    mock_resend: Mock,
) -> None:
    email._last_sent = time.time() - RATE_LIMIT_SECONDS - 1

    with patch.object(settings, "resend_api_key", "test-key"):
        result = send_escalation_email("test")

    assert result is True
    mock_resend.Emails.send.assert_called_once()


@pytest.mark.integration
@requires_resend
def test_send_real_escalation_email() -> None:
    """Send a real email to verify formatting. Run once manually."""
    email._last_sent = 0.0
    result = send_escalation_email(
        reason="Integration test — account closure request",
        user_name="Alex Rivera (Test)",
    )
    assert result is True
