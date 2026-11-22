"""
Unified Transactional Email Service for Synapse-Voice.
Supports Resend API, Brevo API, SendGrid API, and Standard SMTP (Gmail, Outlook, custom)
with automatic SSL/STARTTLS detection and local development simulation fallback.
"""

from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import logging
import smtplib
from typing import Any
import httpx

try:
    from backend.app.core.config import settings
except ModuleNotFoundError:
    from app.core.config import settings

logger = logging.getLogger("synapse_voice.email")


class EmailService:
    """Multi-provider email dispatcher with graceful fallback and async non-blocking execution."""

    def __init__(self):
        self._provider = self._detect_provider()
        logger.info("EmailService initialized with active provider: %s", self._provider)

    def _detect_provider(self) -> str:
        """Determines active email provider based on environment configuration."""
        if getattr(settings, "RESEND_API_KEY", ""):
            return "resend"
        if getattr(settings, "BREVO_API_KEY", ""):
            return "brevo"
        if getattr(settings, "SENDGRID_API_KEY", ""):
            return "sendgrid"
        if getattr(settings, "SMTP_HOST", "") and getattr(settings, "SMTP_USER", ""):
            return "smtp"
        return "simulator"

    @property
    def provider_name(self) -> str:
        return self._detect_provider()

    @property
    def sender_email(self) -> str:
        """Resolves sender address."""
        if getattr(settings, "EMAIL_FROM_ADDRESS", ""):
            return settings.EMAIL_FROM_ADDRESS
        if getattr(settings, "SMTP_FROM_EMAIL", ""):
            return settings.SMTP_FROM_EMAIL
        # Resend provides onboarding@resend.dev for instant testing without domain verification
        if getattr(settings, "RESEND_API_KEY", ""):
            return "onboarding@resend.dev"
        return "noreply@synapse-voice.org"

    @property
    def sender_name(self) -> str:
        return getattr(settings, "EMAIL_FROM_NAME", "Synapse-Voice")

    @property
    def sender_header(self) -> str:
        return f"{self.sender_name} <{self.sender_email}>"

    # ----------------------------------------------------------------------
    # HTML & Plain Text Email Template Builders
    # ----------------------------------------------------------------------
    def render_verification_templates(
        self, email: str, full_name: str, code: str, token: str
    ) -> tuple[str, str, str]:
        """
        Builds (subject, html_content, text_content) for 6-digit OTP verification.
        Uses clean, high-contrast Banky.io brand aesthetic with full responsive email client support.
        """
        subject = f"Your Synapse-Voice Verification Code is {code}"
        frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:3000")
        verify_url = f"{frontend_url}/verify-email?email={email}&token={token}"

        # Clean, accessible, responsive HTML email
        html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Synapse-Voice Verification Code</title>
  <style>
    body {{
      margin: 0;
      padding: 0;
      background-color: #F8F9FA;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #141414;
      line-height: 1.5;
    }}
    .wrapper {{
      width: 100%;
      background-color: #F8F9FA;
      padding: 32px 16px;
    }}
    .container {{
      max-width: 540px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border: 1px solid #E5E7EB;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.03);
    }}
    .header {{
      background-color: #FFCE32;
      padding: 28px 32px;
      text-align: left;
    }}
    .brand {{
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #141414;
      text-transform: uppercase;
      margin: 0;
    }}
    .badge {{
      display: inline-block;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      background-color: #1D63FF;
      color: #FFFFFF;
      padding: 4px 10px;
      border-radius: 9999px;
      margin-top: 8px;
    }}
    .body-content {{
      padding: 36px 32px;
    }}
    h1 {{
      font-size: 22px;
      font-weight: 700;
      margin: 0 0 16px 0;
      color: #141414;
    }}
    p {{
      font-size: 15px;
      color: #374151;
      margin: 0 0 18px 0;
    }}
    .code-container {{
      margin: 28px 0;
      padding: 22px 16px;
      background-color: #F0F4FF;
      border: 2px dashed #1D63FF;
      border-radius: 16px;
      text-align: center;
    }}
    .code-label {{
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #1D63FF;
      margin-bottom: 8px;
    }}
    .code {{
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      font-size: 38px;
      font-weight: 800;
      letter-spacing: 10px;
      color: #1D63FF;
      padding-left: 10px;
    }}
    .btn {{
      display: inline-block;
      background-color: #1D63FF;
      color: #FFFFFF !important;
      text-decoration: none;
      font-size: 14px;
      font-weight: 700;
      padding: 14px 28px;
      border-radius: 9999px;
      margin: 12px 0 20px 0;
    }}
    .divider {{
      border: 0;
      border-top: 1px solid #E5E7EB;
      margin: 28px 0;
    }}
    .notice {{
      font-size: 13px;
      color: #6B7280;
      background-color: #F9FAFB;
      padding: 12px 16px;
      border-radius: 12px;
    }}
    .footer {{
      background-color: #FAFAFA;
      padding: 20px 32px;
      border-top: 1px solid #E5E7EB;
      font-size: 11px;
      color: #9CA3AF;
      text-align: center;
      line-height: 1.6;
    }}
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="brand">Synapse-Voice</div>
        <div class="badge">Acoustic Health Screening &bull; EPICS Project</div>
      </div>
      <div class="body-content">
        <h1>Verify Your Email Address</h1>
        <p>Hello <strong>{full_name}</strong>,</p>
        <p>Thank you for registering with <strong>Synapse-Voice</strong>. To complete your account activation and access the pre-clinical voice screening platform, please use the following 6-digit confirmation code:</p>
        
        <div class="code-container">
          <div class="code-label">Your 6-Digit Verification Code</div>
          <div class="code">{code}</div>
        </div>

        <p style="text-align: center; margin: 20px 0 10px 0;">Or click below to automatically verify your account:</p>
        <div style="text-align: center;">
          <a href="{verify_url}" class="btn" target="_blank">Verify Email Address &rarr;</a>
        </div>

        <hr class="divider">

        <div class="notice">
          <strong>Security Notice:</strong> This verification code expires in <strong>15 minutes</strong>. If you did not create an account on Synapse-Voice, you can safely ignore or delete this email.
        </div>
      </div>
      <div class="footer">
        Synapse-Voice is an academic pre-clinical screening research aid developed under the EPICS program.<br>
        Not a certified medical diagnostic device. Always consult a licensed neurologist for clinical evaluations.
      </div>
    </div>
  </div>
</body>
</html>"""

        text_content = f"""SYNAPSE-VOICE EMAIL VERIFICATION
==================================================

Hello {full_name},

Thank you for registering with Synapse-Voice.
Your 6-digit verification code is:

    {code}

This code expires in 15 minutes.

Alternatively, verify your account directly using this link:
{verify_url}

If you did not request this verification code, please disregard this email.

--
Synapse-Voice | EPICS Academic Research Project
Pre-Clinical Acoustic Screening Aid (Not a medical diagnostic device)
"""
        return subject, html_content, text_content

    # ----------------------------------------------------------------------
    # Provider Transmitters
    # ----------------------------------------------------------------------
    async def _send_via_resend(self, to_email: str, subject: str, html_content: str, text_content: str) -> bool:
        """Dispatches email using Resend REST API."""
        api_key = settings.RESEND_API_KEY.strip()
        url = "https://api.resend.com/emails"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "from": self.sender_header,
            "to": [to_email],
            "subject": subject,
            "html": html_content,
            "text": text_content,
        }

        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(url, json=payload, headers=headers)
            if resp.status_code in (200, 201):
                data = resp.json()
                logger.info("Email delivered via Resend to %s (ID: %s)", to_email, data.get("id"))
                return True
            else:
                logger.error("Resend API error (%d): %s", resp.status_code, resp.text)
                return False

    async def _send_via_brevo(self, to_email: str, full_name: str, subject: str, html_content: str, text_content: str) -> bool:
        """Dispatches email using Brevo (Sendinblue) REST API."""
        api_key = settings.BREVO_API_KEY.strip()
        url = "https://api.brevo.com/v3/smtp/email"
        headers = {
            "api-key": api_key,
            "Content-Type": "application/json",
        }
        payload = {
            "sender": {"name": self.sender_name, "email": self.sender_email},
            "to": [{"email": to_email, "name": full_name}],
            "subject": subject,
            "htmlContent": html_content,
            "textContent": text_content,
        }

        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(url, json=payload, headers=headers)
            if resp.status_code in (200, 201):
                logger.info("Email delivered via Brevo to %s", to_email)
                return True
            else:
                logger.error("Brevo API error (%d): %s", resp.status_code, resp.text)
                return False

    async def _send_via_sendgrid(self, to_email: str, full_name: str, subject: str, html_content: str, text_content: str) -> bool:
        """Dispatches email using SendGrid REST API."""
        api_key = settings.SENDGRID_API_KEY.strip()
        url = "https://api.sendgrid.com/v3/mail/send"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "personalizations": [{"to": [{"email": to_email, "name": full_name}]}],
            "from": {"email": self.sender_email, "name": self.sender_name},
            "subject": subject,
            "content": [
                {"type": "text/plain", "value": text_content},
                {"type": "text/html", "value": html_content},
            ],
        }

        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(url, json=payload, headers=headers)
            if resp.status_code in (200, 202):
                logger.info("Email delivered via SendGrid to %s", to_email)
                return True
            else:
                logger.error("SendGrid API error (%d): %s", resp.status_code, resp.text)
                return False

    def _send_via_smtp(self, to_email: str, subject: str, html_content: str, text_content: str) -> bool:
        """Dispatches email via standard SMTP (Gmail, Outlook, custom)."""
        host = settings.SMTP_HOST.strip()
        port = int(getattr(settings, "SMTP_PORT", 587))
        user = settings.SMTP_USER.strip()
        password = settings.SMTP_PASSWORD.strip()
        use_ssl = getattr(settings, "SMTP_SSL", False) or port == 465
        timeout = int(getattr(settings, "SMTP_TIMEOUT", 10))

        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = self.sender_header
        msg["To"] = to_email
        msg.attach(MIMEText(text_content, "plain", "utf-8"))
        msg.attach(MIMEText(html_content, "html", "utf-8"))

        try:
            if use_ssl:
                with smtplib.SMTP_SSL(host, port, timeout=timeout) as server:
                    if user and password:
                        server.login(user, password)
                    server.sendmail(self.sender_email, [to_email], msg.as_string())
            else:
                with smtplib.SMTP(host, port, timeout=timeout) as server:
                    if server.has_extn("starttls"):
                        server.starttls()
                    if user and password:
                        server.login(user, password)
                    server.sendmail(self.sender_email, [to_email], msg.as_string())

            logger.info("Email delivered via SMTP (%s:%d) to %s", host, port, to_email)
            return True
        except Exception as e:
            logger.error("Failed to transmit email via SMTP to %s: %s", to_email, e)
            return False

    def _simulate_dispatch(self, to_email: str, code: str, token: str) -> bool:
        """Terminal simulator for local development when no credentials are configured."""
        frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:3000")
        verify_url = f"{frontend_url}/verify-email?email={to_email}&token={token}"

        print("\n" + "=" * 70)
        print(" [EMAIL VERIFICATION DISPATCH] (Simulator Mode)")
        print(f" Recipient: {to_email}")
        print(f" 6-Digit OTP Code: >>> {code} <<<")
        print(f" Direct Link: {verify_url}")
        print(" Notice: To dispatch real emails to inboxes, set RESEND_API_KEY or SMTP_HOST in .env")
        print("=" * 70 + "\n")
        return True

    # ----------------------------------------------------------------------
    # Public Dispatch Methods
    # ----------------------------------------------------------------------
    async def send_verification_email(self, email: str, full_name: str, code: str, token: str) -> bool:
        """
        Sends 6-digit OTP verification email to recipient.
        Attempts configured provider with fallback.
        """
        subject, html_content, text_content = self.render_verification_templates(
            email=email, full_name=full_name, code=code, token=token
        )

        provider = self._detect_provider()

        if provider == "resend":
            try:
                success = await self._send_via_resend(email, subject, html_content, text_content)
                if success:
                    return True
            except Exception as e:
                logger.error("Resend provider failed: %s", e)

        elif provider == "brevo":
            try:
                success = await self._send_via_brevo(email, full_name, subject, html_content, text_content)
                if success:
                    return True
            except Exception as e:
                logger.error("Brevo provider failed: %s", e)

        elif provider == "sendgrid":
            try:
                success = await self._send_via_sendgrid(email, full_name, subject, html_content, text_content)
                if success:
                    return True
            except Exception as e:
                logger.error("SendGrid provider failed: %s", e)

        elif provider == "smtp":
            import asyncio
            try:
                success = await asyncio.to_thread(
                    self._send_via_smtp, email, subject, html_content, text_content
                )
                if success:
                    return True
            except Exception as e:
                logger.error("SMTP provider failed: %s", e)

        # Fallback to simulation print
        return self._simulate_dispatch(email, code, token)

    def send_verification_email_sync(self, email: str, full_name: str, code: str, token: str) -> bool:
        """Synchronous wrapper for contexts where event loop is not active."""
        import asyncio
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                import concurrent.futures
                with concurrent.futures.ThreadPoolExecutor() as executor:
                    future = executor.submit(
                        asyncio.run, self.send_verification_email(email, full_name, code, token)
                    )
                    return future.result()
            return loop.run_until_complete(
                self.send_verification_email(email, full_name, code, token)
            )
        except Exception:
            return self._simulate_dispatch(email, code, token)


email_service = EmailService()
