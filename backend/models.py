from datetime import datetime, timezone
from typing import List
from zoneinfo import ZoneInfo

from sqlalchemy import func, Column, DateTime
from sqlmodel import Enum, Relationship, SQLModel, Field
from enum import Enum


class ItemCategory(str, Enum):
    PRODUCE = "produce"
    MEAT = "meat"
    DAIRY = "dairy"
    BAKERY = "bakery"
    PANTRY = "pantry"
    OTHER = "other"


class User(SQLModel, table=True):
    __tablename__: str = "users"
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
    items: List["Item"] = Relationship(back_populates="user")


class Item(SQLModel, table=True):
    __tablename__: str = "items"
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(nullable=False)
    weight: int = Field(nullable=False)
    category: ItemCategory = Field(nullable=False)
    days: int = Field(nullable=False)
    user_id: int = Field(foreign_key="users.id", nullable=False)
    user: "User" = Relationship(back_populates="items")
    saved: bool = Field(default=False)
