from dotenv.main import _load_dotenv_disabled
from fastapi import APIRouter, HTTPException, Request, Response
from pydantic import BaseModel, Field, field_validator
from sentry_sdk.integrations import fastapi
from database import SessionDep
from models import User
from utils import hashPassword, generate6DigitCode, nowPlusMinutes, sendBrevoEmail
from datetime import datetime
from sqlalchemy import select
from utils import verifyPassword, createAccessToken
from fastapi.responses import RedirectResponse
from authlib.integrations.starlette_client import OAuth
from starlette.middleware.sessions import SessionMiddleware
from datetime import datetime, timedelta, timezone
import secrets
from dotenv import load_dotenv
import os

app = APIRouter(prefix="/auth")
load_dotenv()
oauth = OAuth()
oauth.register(
    name="google",
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={"scope": "openid email profile"},
)

REACT_DASHBOARD_URL = os.getenv("REACT_DASHBOARD_URL")


@app.get("/google/login")
async def loginGoogle(request: Request):
    redirect_uri = "http://localhost:8000/auth/google/callback"
    return await oauth.google.authorize_redirect(request, redirect_uri)


@app.get("/google/callback")
async def callback(request: Request, session: SessionDep):
    try:
        token = await oauth.google.authorize_access_token(request)
    except Exception:
        raise HTTPException(status_code=400, detail="Google authentication failed")

    user_info = token.get("userinfo")
    if not user_info:
        raise HTTPException(status_code=400, detail="Could not retrieve user profile")

    email = user_info.get("email")
    name = user_info.get("name")

    stmt = select(User).where(User.email == email)
    user = session.exec(stmt).scalar_one_or_none()

    if not user:
        fallback_username = email.split("@")[0] + secrets.token_hex(2)

        user = User(
            username=fallback_username,
            email=email,
            name=name,
            password=hashPassword(secrets.token_urlsafe(16)),
            enabled=True,
            provider="google",
            verificationCode=None,
            verificationExpiresAt=None,
        )
        session.add(user)
        session.commit()
        session.refresh(user)

    token_jwt = createAccessToken(
        data={
            "userId": user.id,
            "email": user.email,
            "username": user.username,
            "name": user.name,
        }
    )

    response = RedirectResponse(url=REACT_DASHBOARD_URL)
    response.set_cookie(
        key="jwt",
        value=token_jwt,
        httponly=True,
        # secure=True,  # Set to True if testing over production HTTPS
        samesite="lax",
        max_age=60 * 60 * 24,
    )
    return response


class SignupData(BaseModel):
    name: str = Field(
        min_length=1,
        json_schema_extra={
            "error_messages": {"string_too_short": "Full name is required"}
        },
    )
    username: str = Field(
        min_length=1,
        json_schema_extra={
            "error_messages": {"string_too_short": "Username is required"}
        },
    )
    email: str = Field(
        min_length=1,
        json_schema_extra={"error_messages": {"string_too_short": "Email is required"}},
    )
    password: str = Field(
        min_length=8,
        json_schema_extra={
            "error_messages": {
                "string_too_short": "Password must have at least 8 chars"
            }
        },
    )
    passwordConfirmation: str = Field(
        min_length=1,
        json_schema_extra={
            "error_messages": {"string_too_short": "Password Confirmation is required"}
        },
    )


@app.post("/signup")
def signup(data: SignupData, session: SessionDep):
    if data.password != data.passwordConfirmation:
        raise HTTPException(status_code=400, detail="Passwords do not match")
    user = User(
        username=data.username,
        email=data.email,
        name=data.name,
        password=hashPassword(data.password),
        verificationCode=generate6DigitCode(),
        verificationExpiresAt=nowPlusMinutes(5),
        provider="credentials",
    )
    session.add(user)
    session.commit()
    session.refresh(user)

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; padding: 20px; color: #333; background-color: #f9f9f9;">
        <div style="max-width: 400px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; border: 1px solid #ddd;">
            <h2 style="color: #4f46e5; margin-top: 0;">BiteBack</h2>
            <p>Hello,</p>
            <p>Your email verification code is below. It will expire in 5 minutes.</p>

            <div style="background-color: #f3f4f6; padding: 15px; text-align: center; border-radius: 4px; font-size: 28px; font-weight: bold; letter-spacing: 4px; margin: 20px 0;">
                {user.verificationCode}
            </div>

            <p style="font-size: 13px; color: #666;">If you didn't request this, you can safely ignore this email.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin-top: 20px;">
            <p style="font-size: 12px; color: #999;">&copy; 2026 BiteBack</p>
        </div>
    </body>
    </html>
    """
    sendBrevoEmail(user.email, user.name, "Verification account", html_content)
    return user


class VerifyData(BaseModel):
    userId: int
    code: str


@app.post("/verify")
def verify(data: VerifyData, session: SessionDep):
    userStmt = select(User).where(User.id == data.userId)
    user = session.exec(userStmt).scalar_one_or_none()
    print(user)
    if not user:
        raise HTTPException(status_code=400, detail="User not found")
    if user.verificationCode == data.code:
        if user.verificationExpiresAt < datetime.now():
            raise HTTPException(status_code=400, detail="Verification Code has expired")
        user.enabled = True
        user.verificationCode = None
        user.verificationExpiresAt = None
        session.add(user)
        session.commit()
        session.refresh(user)
        return "Account successfully verified"
    else:
        raise HTTPException(status_code=400, detail="Code didn't match")


class ResendData(BaseModel):
    userId: int


@app.post("/resend")
def resend(data: ResendData, session: SessionDep):
    userStmt = select(User).where(User.id == data.userId)
    user = session.exec(userStmt).scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=400, detail="User not found")
    user.verificationCode = generate6DigitCode()
    user.verificationExpiresAt = nowPlusMinutes(5)
    session.add(user)
    session.commit()
    session.refresh(user)
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; padding: 20px; color: #333; background-color: #f9f9f9;">
        <div style="max-width: 400px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; border: 1px solid #ddd;">
            <h2 style="color: #4f46e5; margin-top: 0;">BiteBack</h2>
            <p>Hello,</p>
            <p>Your email verification code is below. It will expire in 5 minutes.</p>

            <div style="background-color: #f3f4f6; padding: 15px; text-align: center; border-radius: 4px; font-size: 28px; font-weight: bold; letter-spacing: 4px; margin: 20px 0;">
                {user.verificationCode}
            </div>

            <p style="font-size: 13px; color: #666;">If you didn't request this, you can safely ignore this email.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin-top: 20px;">
            <p style="font-size: 12px; color: #999;">&copy; 2026 BiteBack</p>
        </div>
    </body>
    </html>
    """
    sendBrevoEmail(user.email, user.name, "Verification account", html_content)
    return user


class LoginData(BaseModel):
    email: str
    password: str


@app.post("/login")
def login(data: LoginData, response: Response, session: SessionDep):
    stmt = select(User).where(User.email == data.email)
    user = session.exec(stmt).scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=400, detail="User not found")

    if user.provider == "google":
        raise HTTPException(
            status_code=400, detail="This account supports only google authentication"
        )

    if verifyPassword(data.password, user.password):
        jwt = createAccessToken(
            data={
                "userId": user.id,
                "email": user.email,
                "username": user.username,
                "name": user.name,
            }
        )
        response.set_cookie(
            key="jwt",
            value=jwt,
            httponly=True,
            # secure=False,
            samesite="lax",
            max_age=60 * 60 * 24,
        )
        return "Successfully logged in"
    raise HTTPException(status_code=400, detail="Wrong credentials")


@app.post("/logout")
def logout(response: Response):
    response.delete_cookie("jwt")
    return {"message": "Logged out successfully"}
