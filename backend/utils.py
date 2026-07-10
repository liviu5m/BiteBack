import os
from dotenv import load_dotenv
from fastapi import HTTPException, Request
from passlib.context import CryptContext
import random
from datetime import datetime, timedelta, timezone
import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException
from typing import Optional
import jwt

load_dotenv(verbose=True)
brevoKey = os.getenv("BREVO_KEY")
SECRET_KEY = os.getenv("SECRET_KEY")
pwd_context = CryptContext(
    schemes=["sha256_crypt"], deprecated="auto", bcrypt__rounds=12
)


def hashPassword(password: str):
    return pwd_context.hash(password)


def verifyPassword(plainPassword, hashedPassword):
    return pwd_context.verify(plainPassword, hashedPassword)


def generate6DigitCode():
    return random.randint(100000, 999999)


def nowPlusMinutes(n: int):
    return datetime.now() + timedelta(minutes=n)


def sendBrevoEmail(to_email: str, to_name: str, subject: str, html_content: str):
    configuration = sib_api_v3_sdk.Configuration()
    print(brevoKey)
    configuration.api_key["api-key"] = brevoKey

    api_instance = sib_api_v3_sdk.TransactionalEmailsApi(
        sib_api_v3_sdk.ApiClient(configuration)
    )

    sender = {"name": "BiteBack", "email": "motpanliviu@gmail.com"}
    to = [{"email": to_email, "name": to_name}]

    send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
        to=to, sender=sender, subject=subject, html_content=html_content
    )

    try:
        api_response = api_instance.send_transac_email(send_smtp_email)
        print("Email sent successfully!")
        print(api_response)
        return True
    except ApiException as e:
        print(f"Exception when calling TransactionalEmailsApi->send_transac_email: {e}")
        return False


ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24


def createAccessToken(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decodeToken(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except:
        return None


def getUserIdFromToken(token: str) -> Optional[int]:
    payload = decodeToken(token)
    if payload:
        return payload.get("userId")
    return None


async def verifyUserTokenSession(request: Request):
    jwtToken = request.cookies.get("jwt")
    print("CHECK ", jwtToken)
    if not jwtToken:
        raise HTTPException(status_code=401, detail="User not authenticated")

    user = decodeToken(jwtToken)

    return user
