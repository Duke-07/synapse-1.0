"""
Authentication and Email Verification Service for Synapse-Voice.
Implements secure PBKDF2 password hashing, standard-compliant HS256 JWT tokens,
OTP verification code generation, and multi-mode email dispatch.
"""

import base64
from datetime import UTC, datetime, timedelta
import hashlib
import hmac
import json
import logging
import os
import re
import secrets
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Any

try:
    from backend.app.core.config import settings
except ModuleNotFoundError:
    from app.core.config import settings

logger = logging.getLogger("synapse_voice.auth")

EMAIL_REGEX = re.compile(r"^[\w\.\+\-]+@[\w\-]+\.[a-zA-Z]{2,}$")

def base64url_encode(data: bytes) -> str:
    """Encodes bytes to Base64URL string without padding."""
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode('ascii')

def base64url_decode(data_str: str) -> bytes:
    """Decodes Base64URL string to bytes handling missing padding."""
    padding = 4 - (len(data_str) % 4)
    if padding != 4:
        data_str += '=' * padding
    return base64.urlsafe_b64decode(data_str.encode('ascii'))


class AuthService:
    def __init__(self):
        self._users: dict[str, dict[str, Any]] = {}
        self._email_index: dict[str, str] = {} # email.lower() -> user_id
        self._reset_tokens: dict[str, dict[str, Any]] = {} # token -> {user_id, expires_at}
        self._store_path = os.path.join(os.path.dirname(__file__), "..", "data", "users_store.json")
        self._load_store()

    def _load_store(self):
        """Loads users from local JSON file if exists."""
        try:
            if os.path.exists(self._store_path):
                with open(self._store_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self._users = data.get("users", {})
                    self._email_index = {u["email"].lower(): uid for uid, u in self._users.items()}
                logger.info("Loaded %d registered user(s) from persistent store.", len(self._users))
        except Exception as e:
            logger.warning("Could not load users_store.json: %s", e)

    def _save_store(self):
        """Persists registered users to local JSON file."""
        try:
            os.makedirs(os.path.dirname(self._store_path), exist_ok=True)
            with open(self._store_path, "w", encoding="utf-8") as f:
                json.dump({"users": self._users}, f, indent=2)
        except Exception as e:
            logger.warning("Could not persist users_store.json: %s", e)

    # -------------------------------------------------------------
    # Password Hashing (PBKDF2-HMAC-SHA256, 100,000 iterations)
    # -------------------------------------------------------------
    @staticmethod
    def hash_password(password: str) -> str:
        """Hashes password using PBKDF2-HMAC-SHA256 with 16-byte random salt."""
        salt = secrets.token_hex(16)
        iterations = 100_000
        key = hashlib.pbkdf2_hmac(
            "sha256",
            password.encode("utf-8"),
            salt.encode("utf-8"),
            iterations
        )
        return f"{salt}${iterations}${key.hex()}"

    @staticmethod
    def verify_password(password: str, hashed_str: str) -> bool:
        """Verifies candidate password against stored salt$iterations$key."""
        try:
            salt, iter_str, key_hex = hashed_str.split("$")
            iterations = int(iter_str)
            computed_key = hashlib.pbkdf2_hmac(
                "sha256",
                password.encode("utf-8"),
                salt.encode("utf-8"),
                iterations
            )
            return hmac.compare_digest(computed_key.hex(), key_hex)
        except Exception:
            return False

    # -------------------------------------------------------------
    # RFC 7519 JSON Web Token (HS256)
    # -------------------------------------------------------------
    def create_access_token(self, subject: str, email: str, expires_delta: timedelta | None = None) -> str:
        """Generates standard RFC 7519 HS256 JWT access token."""
        header = {"alg": "HS256", "typ": "JWT"}
        delta = expires_delta or timedelta(minutes=settings.JWT_EXPIRE_MINUTES)
        now = datetime.now(UTC)
        exp = int((now + delta).timestamp())
        iat = int(now.timestamp())
        
        payload = {
            "sub": subject,
            "email": email,
            "iat": iat,
            "exp": exp,
            "iss": "synapse-voice-api"
        }
        
        header_enc = base64url_encode(json.dumps(header, separators=(',', ':')).encode('utf-8'))
        payload_enc = base64url_encode(json.dumps(payload, separators=(',', ':')).encode('utf-8'))
        message = f"{header_enc}.{payload_enc}".encode('ascii')
        
        signature = hmac.new(
            settings.JWT_SECRET.encode('utf-8'),
            message,
            hashlib.sha256
        ).digest()
        sig_enc = base64url_encode(signature)
        
        return f"{header_enc}.{payload_enc}.{sig_enc}"

    def decode_access_token(self, token: str) -> dict[str, Any] | None:
        """Decodes and cryptographically verifies an HS256 JWT access token."""
        try:
            parts = token.split('.')
            if len(parts) != 3:
                return None
            header_enc, payload_enc, sig_enc = parts
            
            # Verify signature
            message = f"{header_enc}.{payload_enc}".encode('ascii')
            expected_sig = hmac.new(
                settings.JWT_SECRET.encode('utf-8'),
                message,
                hashlib.sha256
            ).digest()
            provided_sig = base64url_decode(sig_enc)
            
            if not hmac.compare_digest(expected_sig, provided_sig):
                return None
                
            payload_bytes = base64url_decode(payload_enc)
            payload = json.loads(payload_bytes.decode('utf-8'))
            
            # Check expiration
            exp = payload.get("exp")
            if exp and datetime.now(UTC).timestamp() > exp:
                return None
                
            return payload
        except Exception:
            return None

    # -------------------------------------------------------------
    # Email Delivery & Simulation
    # -------------------------------------------------------------
    def send_verification_email(self, email: str, full_name: str, code: str, token: str) -> bool:
        """Dispatches HTML verification email via SMTP or development simulator."""
        verify_url = f"{settings.FRONTEND_URL}/verify-email?email={email}&token={token}"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0c0a09; color: #f5f5f4; margin: 0; padding: 24px; }}
            .card {{ max-width: 560px; margin: 0 auto; background-color: #1c1917; border: 1px solid #292524; border-radius: 12px; padding: 32px; }}
            .brand {{ font-size: 20px; font-weight: bold; color: #ef4444; margin-bottom: 20px; }}
            .code-box {{ font-size: 32px; font-family: monospace; font-weight: bold; letter-spacing: 6px; background-color: #292524; color: #ffffff; padding: 16px; text-align: center; border-radius: 8px; margin: 24px 0; border: 1px solid #dc2626; }}
            .button {{ display: inline-block; background-color: #dc2626; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 16px; }}
            .footer {{ margin-top: 32px; font-size: 11px; color: #78716c; border-top: 1px solid #292524; padding-top: 16px; }}
          </style>
        </head>
        <body>
          <div class="card">
            <div class="brand">Synapse-Voice</div>
            <h2>Verify Your Email Address</h2>
            <p>Hello {full_name},</p>
            <p>Thank you for registering with Synapse-Voice, an academic pre-clinical Parkinson's voice screening platform.</p>
            <p>Please enter the following 6-digit verification code to activate your account:</p>
            
            <div class="code-box">{code}</div>
            
            <p>Alternatively, click the link below to verify your account directly:</p>
            <p><a href="{verify_url}" class="button">Verify Email Address</a></p>
            
            <p style="font-size: 12px; color: #a8a29e; margin-top: 24px;">This code will expire in 60 minutes. If you did not create a Synapse-Voice account, please disregard this email.</p>
            
            <div class="footer">
              Synapse-Voice (EPICS Project) • Pre-clinical acoustic screening aid • Not a medical diagnostic device.
            </div>
          </div>
        </body>
        </html>
        """
        
        # Log to terminal for immediate developer/user visibility
        print("=" * 65)
        print(f"[AUTH EMAIL SIMULATION] Verification email dispatched to: {email}")
        print(f"VERIFICATION CODE: {code}")
        print(f"DIRECT VERIFY LINK: {verify_url}")
        print("=" * 65)
        
        # Attempt real SMTP transmission if configured
        if settings.SMTP_HOST and settings.SMTP_USER and settings.SMTP_PASSWORD:
            try:
                msg = MIMEMultipart("alternative")
                msg["Subject"] = f"Your Synapse-Voice Verification Code: {code}"
                msg["From"] = settings.SMTP_FROM_EMAIL
                msg["To"] = email
                msg.attach(MIMEText(f"Your verification code is: {code}\nVerify link: {verify_url}", "plain"))
                msg.attach(MIMEText(html_content, "html"))
                
                with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as server:
                    server.starttls()
                    server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                    server.sendmail(settings.SMTP_FROM_EMAIL, [email], msg.as_string())
                logger.info("Verification email transmitted via SMTP to %s", email)
                return True
            except Exception as e:
                logger.error("Failed to send verification email via SMTP to %s: %s", email, e)
                return False
                
        return True

    # -------------------------------------------------------------
    # User Registration, Verification, Login
    # -------------------------------------------------------------
    def register(self, email: str, password: str, full_name: str) -> tuple[dict[str, Any], str]:
        """Registers a new user account and returns user profile and OTP code."""
        clean_email = email.strip().lower()
        if not EMAIL_REGEX.match(clean_email):
            raise ValueError("Please provide a valid email address.")
        if len(password) < 8:
            raise ValueError("Password must be at least 8 characters.")
            
        if clean_email in self._email_index:
            raise ValueError("An account with this email address already exists. Please sign in or verify your email.")
            
        user_id = secrets.token_hex(12)
        now_iso = datetime.now(UTC).isoformat()
        hashed_pwd = self.hash_password(password)
        code = f"{secrets.randbelow(900000) + 100000:06d}"
        token = secrets.token_urlsafe(32)
        expires_at = (datetime.now(UTC) + timedelta(hours=1)).isoformat()
        
        user_record = {
            "id": user_id,
            "email": clean_email,
            "full_name": full_name.strip(),
            "password_hash": hashed_pwd,
            "is_verified": False,
            "verification_code": code,
            "verification_token": token,
            "verification_expires_at": expires_at,
            "created_at": now_iso
        }
        
        self._users[user_id] = user_record
        self._email_index[clean_email] = user_id
        self._save_store()
        
        # Dispatch verification email
        self.send_verification_email(clean_email, full_name, code, token)
        
        profile = {
            "id": user_id,
            "email": clean_email,
            "full_name": user_record["full_name"],
            "is_verified": False,
            "created_at": now_iso
        }
        return profile, code

    def verify_email(self, email: str, code_or_token: str) -> tuple[str, dict[str, Any]]:
        """Verifies email by code or URL token. Returns (access_token, user_profile)."""
        clean_email = email.strip().lower()
        user_id = self._email_index.get(clean_email)
        if not user_id:
            raise ValueError("No account found with this email address.")
            
        user = self._users[user_id]
        if user.get("is_verified", False):
            # Already verified; generate fresh token
            token = self.create_access_token(user_id, clean_email)
            profile = {
                "id": user_id,
                "email": clean_email,
                "full_name": user["full_name"],
                "is_verified": True,
                "created_at": user["created_at"]
            }
            return token, profile
            
        stored_code = user.get("verification_code", "")
        stored_token = user.get("verification_token", "")
        clean_input = code_or_token.strip()
        
        if clean_input not in (stored_code, stored_token):
            raise ValueError("Invalid verification code. Please check your email or request a new code.")
            
        # Check expiry
        expires_at = user.get("verification_expires_at")
        if expires_at and datetime.fromisoformat(expires_at) < datetime.now(UTC):
            raise ValueError("Verification code has expired. Please request a new verification code.")
            
        # Mark verified
        user["is_verified"] = True
        user["verification_code"] = None
        user["verification_token"] = None
        self._save_store()
        
        access_token = self.create_access_token(user_id, clean_email)
        profile = {
            "id": user_id,
            "email": clean_email,
            "full_name": user["full_name"],
            "is_verified": True,
            "created_at": user["created_at"]
        }
        return access_token, profile

    def resend_verification(self, email: str) -> str:
        """Generates and sends a new verification code for unverified user."""
        clean_email = email.strip().lower()
        user_id = self._email_index.get(clean_email)
        if not user_id:
            raise ValueError("No account found with this email address.")
            
        user = self._users[user_id]
        if user.get("is_verified", False):
            raise ValueError("This email address has already been verified. Please log in.")
            
        new_code = f"{secrets.randbelow(900000) + 100000:06d}"
        new_token = secrets.token_urlsafe(32)
        user["verification_code"] = new_code
        user["verification_token"] = new_token
        user["verification_expires_at"] = (datetime.now(UTC) + timedelta(hours=1)).isoformat()
        self._save_store()
        
        self.send_verification_email(clean_email, user["full_name"], new_code, new_token)
        return new_code

    def login(self, email: str, password: str) -> tuple[str, dict[str, Any]]:
        """Authenticates user credentials and returns (access_token, user_profile)."""
        clean_email = email.strip().lower()
        user_id = self._email_index.get(clean_email)
        if not user_id:
            raise ValueError("Invalid email or password.")
            
        user = self._users[user_id]
        if not self.verify_password(password, user["password_hash"]):
            raise ValueError("Invalid email or password.")
            
        # Optional: warn if unverified, but allow login with is_verified status reflected
        access_token = self.create_access_token(user_id, clean_email)
        profile = {
            "id": user_id,
            "email": clean_email,
            "full_name": user["full_name"],
            "is_verified": bool(user.get("is_verified", False)),
            "created_at": user["created_at"]
        }
        return access_token, profile

    def get_user_by_id(self, user_id: str) -> dict[str, Any] | None:
        """Returns user profile dictionary for a given ID."""
        user = self._users.get(user_id)
        if not user:
            return None
        return {
            "id": user["id"],
            "email": user["email"],
            "full_name": user["full_name"],
            "is_verified": bool(user.get("is_verified", False)),
            "created_at": user["created_at"]
        }

    def request_password_reset(self, email: str) -> str:
        """Generates reset token and sends email."""
        clean_email = email.strip().lower()
        user_id = self._email_index.get(clean_email)
        if not user_id:
            return "" # Silently return to prevent user enumeration
            
        token = secrets.token_urlsafe(32)
        self._reset_tokens[token] = {
            "user_id": user_id,
            "expires_at": datetime.now(UTC) + timedelta(minutes=30)
        }
        
        reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
        print(f"[AUTH PASSWORD RESET] Reset token generated for {clean_email}: {reset_url}")
        return token

    def reset_password(self, token: str, new_password: str) -> bool:
        """Applies new password using validated reset token."""
        entry = self._reset_tokens.get(token)
        if not entry:
            raise ValueError("Invalid or expired password reset link.")
        if entry["expires_at"] < datetime.now(UTC):
            del self._reset_tokens[token]
            raise ValueError("Password reset link has expired.")
            
        user_id = entry["user_id"]
        user = self._users.get(user_id)
        if not user:
            raise ValueError("User not found.")
            
        user["password_hash"] = self.hash_password(new_password)
        self._save_store()
        del self._reset_tokens[token]
        return True

auth_service = AuthService()
