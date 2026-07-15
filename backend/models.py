from datetime import datetime, timezone, date
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


class RecipeDifficulty(str, Enum):
    EASY = "Easy"
    MEDIUM = "Medium"
    HARD = "Hard"


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
    createdAt: datetime = Field(default=datetime.now, nullable=False)
    enabled: bool = Field(default=False)
    items: List["Item"] = Relationship(back_populates="user")
    recipes: List["Recipe"] = Relationship(back_populates="user")
    shareItems: List["ShareItem"] = Relationship(back_populates="user")


class Item(SQLModel, table=True):
    __tablename__: str = "items"
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(nullable=False)
    weight: int = Field(nullable=False)
    category: ItemCategory = Field(nullable=False)
    expiryDate: date = Field(nullable=False)
    user_id: int = Field(foreign_key="users.id", nullable=False)
    user: "User" = Relationship(back_populates="items")
    saved: bool = Field(default=False)
    createdAt: datetime = Field(default=datetime.now(), nullable=False)


class Recipe(SQLModel, table=True):
    __tablename__: str = "recipes"
    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", nullable=False)
    user: User = Relationship(back_populates="recipes")
    recipe_name: str = Field(nullable=False)
    match_percentage: int = Field(nullable=False)
    prep_time_minutes: int = Field(nullable=False)
    difficulty: RecipeDifficulty = Field(nullable=False)
    cuisine_tag: str = Field(nullable=False)
    hook_line: str = Field(nullable=False)
    used_ingredients: str = Field(nullable=False)
    missing_ingredients: str = Field(nullable=False)
    preservation_tip: str = Field(nullable=False)
    image_url: str = Field(nullable=False)


class ShareItem(SQLModel, table=True):
    __tablename__: str = "share_items"
    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", nullable=False)
    user: User = Relationship(back_populates="shareItems")
    name: str = Field(nullable=False)
    expiryDate: date = Field(nullable=False)
    weight: int = Field(nullable=False)
    notes: str = Field(nullable=True)
    location: str = Field(nullable=False)


class RequestStatus(str, Enum):
    PENDING = "pending"  # Request initiated by a buyer
    ACCEPTED = "accepted"  # Owner approved, waiting for pickup
    REJECTED = "rejected"  # Owner declined the request
    COMPLETED = "completed"  # Handover confirmed, item taken
    CANCELLED = "cancelled"  # Cancelled by either party


class ProductRequest(SQLModel, table=True):
    __tablename__ = "product_requests"
    id: int | None = Field(default=None, primary_key=True)
    share_item_id: int = Field(
        foreign_key="share_items.id", nullable=False, ondelete="CASCADE"
    )
    requester_id: int = Field(
        foreign_key="users.id", nullable=False, ondelete="CASCADE"
    )
    status: RequestStatus = Field(default=RequestStatus.PENDING, nullable=False)
    createdAt: datetime = Field(default_factory=datetime.utcnow, nullable=False)


class ChatRoom(SQLModel, table=True):
    __tablename__ = "chat_rooms"
    id: int | None = Field(default=None, primary_key=True)
    user_one_id: int = Field(foreign_key="users.id", nullable=False)
    user_two_id: int = Field(foreign_key="users.id", nullable=False)
    createdAt: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    messages: List["Message"] = Relationship(back_populates="chat_room")
    user_one: "User" = Relationship(
        sa_relationship_kwargs={"foreign_keys": "[ChatRoom.user_one_id]"}
    )
    user_two: "User" = Relationship(
        sa_relationship_kwargs={"foreign_keys": "[ChatRoom.user_two_id]"}
    )


class Message(SQLModel, table=True):
    __tablename__ = "messages"
    id: int | None = Field(default=None, primary_key=True)
    chat_room_id: int = Field(foreign_key="chat_rooms.id", nullable=False)
    sender_id: int = Field(foreign_key="users.id", nullable=False)
    text: str = Field(nullable=False)
    createdAt: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    chat_room: ChatRoom = Relationship(back_populates="messages")
