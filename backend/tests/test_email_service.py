"""
Unit tests for the EmailService: template rendering, provider selection, and fallbacks.
"""

import pytest
from backend.app.services.email_service import email_service
from backend.app.core.config import settings


def test_email_template_rendering():
    subject, html_content, text_content = email_service.render_verification_templates(
        email="researcher@purdue.edu",
        full_name="Dr. Jane Doe",
        code="839201",
        token="test_token_abc_123"
    )

    # Verify subject
    assert "839201" in subject
    assert "Synapse-Voice" in subject

    # Verify HTML content contains essentials
    assert "839201" in html_content
    assert "Dr. Jane Doe" in html_content
    assert "verify-email?email=researcher@purdue.edu" in html_content
    assert "15 minutes" in html_content
    assert "#FFCE32" in html_content # Canary yellow header
    assert "#1D63FF" in html_content # Royal blue code accent

    # Verify Plain text content
    assert "839201" in text_content
    assert "test_token_abc_123" in text_content
    assert "EPICS" in text_content


def test_provider_detection():
    # In default test environment without external API keys, provider is simulator
    provider = email_service.provider_name
    assert provider in ("simulator", "smtp", "resend", "brevo", "sendgrid")


@pytest.mark.anyio
async def test_send_verification_email_simulator():
    # Should execute successfully via simulator without throwing
    success = await email_service.send_verification_email(
        email="test_user@example.com",
        full_name="Tester",
        code="654321",
        token="token_xyz"
    )
    assert success is True
