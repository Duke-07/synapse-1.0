"""
Authentication and Email Verification Service for Synapse-Voice.
Implements secure PBKDF2 password hashing, standard-compliant HS256 JWT tokens,
OTP verification code generation, rate limiting, and multi-provider email dispatch.
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
from typing import Any

try:
    from backend.app.core.config import settings
    from backend.app.services.email_service import email_service
except ModuleNotFoundError:
    from app.core.config import settings
    from app.services.email_service import email_service

logger = logging.getLogger("synapse_voice.auth")

EMAIL_REGEX = re.compile(r"^[\w\.\+\-]+@[\w\-]+\.[a-zA-Z]{2,}$")


def base64url_encode(data: bytes) -> str:
    """Encodes bytes to Base64URL string without padding."""
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def base64url_decode(data_str: str) -> bytes:
    """Decodes Base64URL string to bytes handling missing padding."""
    padding = 4 - (len(data_str) % 4)
    if padding != 4:
        data_str += "=" * padding
    return base64.urlsafe_b64decode(data_str.encode("ascii"))


class AuthService:
    def __init__(self):
        self._users: dict[str, dict[str, Any]] = {}
        self._email_index: dict[str, str] = {}  # email.lower() -> user_id
        self._reset_tokens: dict[str, dict[str, Any]] = {}  # token -> {user_id, expires_at}
        self._store_path = os.path.join(
            os.path.dirname(__file__), "..", "data", "users_store.json"
        )
        self._load_store()

    def _load_store(self):
        """Loads users from local JSON file if exists."""
        try:
            if os.path.exists(self._store_path):
                with open(self._store_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self._users = data.get("users", {})
                    self._email_index = {
                        u["email"].lower(): uid for uid, u in self._users.items()
                    }
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
            "sha256", password.encode("utf-8"), salt.encode("utf-8"), iterations
        )
        return f"{salt}${iterations}${key.hex()}"

    @staticmethod
    def verify_password(password: str, hashed_str: str) -> bool:
        """Verifies candidate password against stored salt$iterations$key."""
        try:
            salt, iter_str, key_hex = hashed_str.split("$")
            iterations = int(iter_str)
            computed_key = hashlib.pbkdf2_hmac(
                "sha256", password.encode("utf-8"), salt.encode("utf-8"), iterations
            )
            return hmac.compare_digest(computed_key.hex(), key_hex)
        except Exception:
            return False

    # -------------------------------------------------------------
    # RFC 7519 JSON Web Token (HS256)
    # -------------------------------------------------------------
    def create_access_token(
        self, subject: str, email: str, expires_delta: timedelta | None = None
    ) -> str:
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
            "iss": "synapse-voice-api",
        }

        header_enc = base64url_encode(json.dumps(header, separators=(",", ":")).encode("utf-8"))
        payload_enc = base64url_encode(json.dumps(payload, separators=(",", ":")).encode("utf-8"))
        message = f"{header_enc}.{payload_enc}".encode("ascii")

        signature = hmac.new(
            settings.JWT_SECRET.encode("utf-8"), message, hashlib.sha256
        ).digest()
        sig_enc = base64url_encode(signature)

        return f"{header_enc}.{payload_enc}.{sig_enc}"

    def decode_access_token(self, token: str) -> dict[str, Any] | None:
        """Decodes and cryptographically verifies an HS256 JWT access token."""
        try:
            parts = token.split(".")
            if len(parts) != 3:
                return None
            header_enc, payload_enc, sig_enc = parts

            message = f"{header_enc}.{payload_enc}".encode("ascii")
            expected_sig = hmac.new(
                settings.JWT_SECRET.encode("utf-8"), message, hashlib.sha256
            ).digest()
            provided_sig = base64url_decode(sig_enc)

            if not hmac.compare_digest(expected_sig, provided_sig):
                return None

            payload_bytes = base64url_decode(payload_enc)
            payload = json.loads(payload_bytes.decode("utf-8"))

            exp = payload.get("exp")
            if exp and datetime.now(UTC).timestamp() > exp:
                return None

            return payload
        except Exception:
            return None

    # -------------------------------------------------------------
    # Email Delivery Wrapper
    # -------------------------------------------------------------
    def send_verification_email(self, email: str, full_name: str, code: str, token: str) -> bool:
        """Dispatches verification email via active EmailService provider."""
        return email_service.send_verification_email_sync(email, full_name, code, token)

    # -------------------------------------------------------------
    # User Registration, Verification, Login
    # -------------------------------------------------------------
    def register(
        self, email: str, password: str, full_name: str, dispatch_sync: bool = True
    ) -> tuple[dict[str, Any], str, str]:
        """
        Registers a new user account.
        Returns (user_profile, verification_code, verification_token).
        """
        clean_email = email.strip().lower()
        if not EMAIL_REGEX.match(clean_email):
            raise ValueError("Please provide a valid email address.")
        if len(password) < 8:
            raise ValueError("Password must be at least 8 characters.")

        if clean_email in self._email_index:
            existing_user = self._users[self._email_index[clean_email]]
            if existing_user.get("is_verified", False):
                raise ValueError("An account with this email address already exists. Please sign in.")
            else:
                raise ValueError(
                    "An account with this email already exists but is unverified. "
                    "Please check your inbox or request a new verification code."
                )

        user_id = secrets.token_hex(12)
        now_utc = datetime.now(UTC)
        now_iso = now_utc.isoformat()
        hashed_pwd = self.hash_password(password)
        code = f"{secrets.randbelow(900000) + 100000:06d}"
        token = secrets.token_urlsafe(32)
        # 15 minutes OTP expiration window (standard security practice)
        expires_at = (now_utc + timedelta(minutes=15)).isoformat()

        user_record = {
            "id": user_id,
            "email": clean_email,
            "full_name": full_name.strip(),
            "password_hash": hashed_pwd,
            "is_verified": False,
            "verification_code": code,
            "verification_token": token,
            "verification_expires_at": expires_at,
            "last_code_sent_at": now_iso,
            "failed_attempts": 0,
            "created_at": now_iso,
        }

        self._users[user_id] = user_record
        self._email_index[clean_email] = user_id
        self._save_store()

        if dispatch_sync:
            self.send_verification_email(clean_email, full_name, code, token)

        profile = {
            "id": user_id,
            "email": clean_email,
            "full_name": user_record["full_name"],
            "is_verified": False,
            "created_at": now_iso,
        }
        return profile, code, token

    def verify_email(self, email: str, code_or_token: str) -> tuple[str, dict[str, Any]]:
        """Verifies email by 6-digit code or direct link token. Returns (access_token, user_profile)."""
        clean_email = email.strip().lower()
        user_id = self._email_index.get(clean_email)
        if not user_id:
            raise ValueError("No account found with this email address.")

        user = self._users[user_id]
        if user.get("is_verified", False):
            token = self.create_access_token(user_id, clean_email)
            profile = {
                "id": user_id,
                "email": clean_email,
                "full_name": user["full_name"],
                "is_verified": True,
                "created_at": user["created_at"],
            }
            return token, profile

        # Check brute force threshold (max 5 failed attempts)
        failed = user.get("failed_attempts", 0)
        if failed >= 5:
            raise ValueError(
                "Too many incorrect verification attempts. For your security, please request a new verification code."
            )

        stored_code = str(user.get("verification_code", "")).strip()
        stored_token = str(user.get("verification_token", "")).strip()
        clean_input = code_or_token.strip()

        # Check expiry first
        expires_at = user.get("verification_expires_at")
        if expires_at and datetime.fromisoformat(expires_at) < datetime.now(UTC):
            raise ValueError(
                "Verification code has expired. Please request a new 6-digit code."
            )

        # Constant-time comparison
        is_code_match = bool(stored_code) and hmac.compare_digest(clean_input, stored_code)
        is_token_match = bool(stored_token) and hmac.compare_digest(clean_input, stored_token)

        if not (is_code_match or is_token_match):
            user["failed_attempts"] = failed + 1
            self._save_store()
            attempts_left = 5 - user["failed_attempts"]
            if attempts_left > 0:
                raise ValueError(
                    f"Invalid verification code. Please check your email. ({attempts_left} attempt(s) remaining)"
                )
            else:
                raise ValueError(
                    "Invalid verification code. Maximum attempts reached. Please request a new code."
                )

        # Mark verified & clean up OTP credentials
        user["is_verified"] = True
        user["verification_code"] = None
        user["verification_token"] = None
        user["verification_expires_at"] = None
        user["failed_attempts"] = 0
        self._save_store()

        access_token = self.create_access_token(user_id, clean_email)
        profile = {
            "id": user_id,
            "email": clean_email,
            "full_name": user["full_name"],
            "is_verified": True,
            "created_at": user["created_at"],
        }
        return access_token, profile

    def resend_verification(
        self, email: str, dispatch_sync: bool = True
    ) -> tuple[str, str, str]:
        """
        Generates and sends a new 6-digit verification code.
        Enforces a 60-second cooldown between resends.
        Returns (new_code, new_token, full_name).
        """
        clean_email = email.strip().lower()
        user_id = self._email_index.get(clean_email)
        if not user_id:
            raise ValueError("No account found with this email address.")

        user = self._users[user_id]
        if user.get("is_verified", False):
            raise ValueError("This email address has already been verified. Please log in.")

        now_utc = datetime.now(UTC)

        # Cooldown check: 60 seconds between resends
        last_sent_iso = user.get("last_code_sent_at")
        if last_sent_iso:
            try:
                last_sent = datetime.fromisoformat(last_sent_iso)
                elapsed = (now_utc - last_sent).total_seconds()
                if elapsed < 60:
                    remaining = int(60 - elapsed)
                    raise ValueError(
                        f"Please wait {remaining} seconds before requesting another verification code."
                    )
            except (ValueError, TypeError):
                pass

        new_code = f"{secrets.randbelow(900000) + 100000:06d}"
        new_token = secrets.token_urlsafe(32)
        user["verification_code"] = new_code
        user["verification_token"] = new_token
        user["verification_expires_at"] = (now_utc + timedelta(minutes=15)).isoformat()
        user["last_code_sent_at"] = now_utc.isoformat()
        user["failed_attempts"] = 0
        self._save_store()

        if dispatch_sync:
            self.send_verification_email(clean_email, user["full_name"], new_code, new_token)

        return new_code, new_token, user["full_name"]

    def login(self, email: str, password: str) -> tuple[str, dict[str, Any]]:
        """Authenticates user credentials and returns (access_token, user_profile)."""
        clean_email = email.strip().lower()
        user_id = self._email_index.get(clean_email)
        if not user_id:
            raise ValueError("Invalid email or password.")

        user = self._users[user_id]
        if not self.verify_password(password, user["password_hash"]):
            raise ValueError("Invalid email or password.")

        access_token = self.create_access_token(user_id, clean_email)
        profile = {
            "id": user_id,
            "email": clean_email,
            "full_name": user["full_name"],
            "is_verified": bool(user.get("is_verified", False)),
            "created_at": user["created_at"],
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
            "created_at": user["created_at"],
        }


auth_service = AuthService()
