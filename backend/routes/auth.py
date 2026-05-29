from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, field_validator
from sentry_sdk.integrations import fastapi
from database import SessionDep
from models import User
from utils import hashPassword, generate6DigitCode, nowPlusMinutes, sendBrevoEmail

app = APIRouter(prefix="/auth")

class SignupData(BaseModel):
    name: str = Field(
        min_length=1,
        json_schema_extra={"error_messages": {"string_too_short": "Full name is required"}}
    )
    username: str = Field(
        min_length=1,
        json_schema_extra={"error_messages": {"string_too_short": "Username is required"}}
    )
    email: str = Field(
        min_length=1,
        json_schema_extra={"error_messages": {"string_too_short": "Email is required"}}
    )
    password: str = Field(
        min_length=8,
        json_schema_extra={"error_messages": {"string_too_short": "Password must have at least 8 chars"}}
    )
    passwordConfirmation: str = Field(
        min_length=1,
        json_schema_extra={"error_messages": {"string_too_short": "Password Confirmation is required"}}
    )
@app.post("/signup")
def signup(data: SignupData, session: SessionDep):
    if(data.password != data.passwordConfirmation):
        raise HTTPException(status_code=400, detail="Passwords do not match")
    user = User(username=data.username, email=data.email, name=data.name, password=hashPassword(data.password), verificationCode=generate6DigitCode(), verificationExpiresAt=nowPlusMinutes(5))
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



@app.post("/verify")
def verify(data: , session: SessionDep):

