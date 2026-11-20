"""
Pytest Suite for Authentication and Email Verification Endpoints.
"""

import pytest
from fastapi.testclient import TestClient

from backend.app.main import app

client = TestClient(app)

@pytest.fixture
def unique_email():
    import uuid
    return f"user_{uuid.uuid4().hex[:8]}@example.com"

def test_register_and_verify_flow(unique_email):
    # 1. Register
    reg_payload = {
        "email": unique_email,
        "password": "StrongPassword123!",
        "full_name": "Dr. Sarah Connor"
    }
    res = client.post("/api/v1/auth/register", json=reg_payload)
    assert res.status_code == 201
    reg_data = res.json()
    assert reg_data["success"] is True
    assert "verification_code_preview" in reg_data
    code = reg_data["verification_code_preview"]
    assert len(code) == 6

    # 2. Duplicate registration attempt should fail with HTTP 400
    res_dup = client.post("/api/v1/auth/register", json=reg_payload)
    assert res_dup.status_code == 400
    assert "already exists" in res_dup.json()["detail"].lower()

    # 3. Invalid verification code rejection
    res_bad_verify = client.post("/api/v1/auth/verify-email", json={
        "email": unique_email,
        "code": "000000"
    })
    assert res_bad_verify.status_code == 400
    assert "invalid" in res_bad_verify.json()["detail"].lower()

    # 4. Valid verification code confirmation
    res_verify = client.post("/api/v1/auth/verify-email", json={
        "email": unique_email,
        "code": code
    })
    assert res_verify.status_code == 200
    ver_data = res_verify.json()
    assert "access_token" in ver_data
    assert ver_data["user"]["is_verified"] is True
    token = ver_data["access_token"]

    # 5. Access protected /auth/me profile
    res_me = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res_me.status_code == 200
    me_data = res_me.json()
    assert me_data["email"] == unique_email
    assert me_data["full_name"] == "Dr. Sarah Connor"
    assert me_data["is_verified"] is True

    # 6. Login with verified account
    res_login = client.post("/api/v1/auth/login", json={
        "email": unique_email,
        "password": "StrongPassword123!"
    })
    assert res_login.status_code == 200
    login_data = res_login.json()
    assert "access_token" in login_data
    assert login_data["user"]["is_verified"] is True

    # 7. Login with invalid password
    res_bad_login = client.post("/api/v1/auth/login", json={
        "email": unique_email,
        "password": "WrongPassword999!"
    })
    assert res_bad_login.status_code == 401

def test_unauthenticated_me_access():
    res = client.get("/api/v1/auth/me")
    assert res.status_code == 401

def test_resend_verification_endpoint(unique_email):
    # Register first with distinct email
    email2 = f"resend_{unique_email}"
    res_reg = client.post("/api/v1/auth/register", json={
        "email": email2,
        "password": "Password123!",
        "full_name": "Alex Mercer"
    })
    assert res_reg.status_code == 201
    
    # Resend verification code
    res = client.post("/api/v1/auth/resend-verification", json={"email": email2})
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert len(data["verification_code_preview"]) == 6
