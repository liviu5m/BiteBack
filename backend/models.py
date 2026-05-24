from datetime import datetime

from sqlalchemy import func
from sqlmodel import SQLModel, Field


class User(SQLModel, table=True):
    __tablename__ = "users"
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(nullable=False)
    username: str = Field(index=True, unique=True, nullable=False)
    email: str = Field(index=True, unique=True, nullable=False)
    password: str = Field(nullable=False, min_length=8)
    provider: str = Field(default="credentials")
    createdAt: datetime = Field(
        sa_column_kwargs={"server_default": func.now()}
    )
