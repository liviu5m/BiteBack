from datetime import datetime, timezone
from zoneinfo import ZoneInfo

from sqlalchemy import func, Column, DateTime
from sqlmodel import SQLModel, Field


class User(SQLModel, table=True):
    __tablename__ = "users"
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(nullable=False)
    username: str = Field(index=True, unique=True, nullable=False)
    email: str = Field(index=True, unique=True, nullable=False)
    password: str = Field(nullable=False, min_length=8)
    provider: str = Field(default="credentials")
    verificationCode: str = Field(nullable=True)
    verificationExpiresAt: datetime = Field(nullable=True)
    createdAt: datetime = Field(default=datetime.now(), nullable=False)
    enabled: bool = Field(default=False)
