from typing import Any
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlmodel import select
from database import SessionDep
from models import Item, ItemCategory
from utils import verifyUserTokenSession


app = APIRouter(prefix="/api/item", dependencies=[Depends(verifyUserTokenSession)])


class ItemData(BaseModel):
    name: str
    days: int
    category: ItemCategory
    weight: int


@app.post("/")
def createItem(
    data: ItemData,
    session: SessionDep,
    user: dict = Depends(verifyUserTokenSession),
):
    print(user)
    item = Item(
        name=data.name,
        days=data.days,
        category=data.category,
        weight=data.weight,
        user_id=user["userId"],
    )
    session.add(item)
    session.commit()
    session.refresh(item)
    return item


@app.get("/")
def getItemByUserId(
    session: SessionDep, user: dict[Any, Any] = Depends(verifyUserTokenSession)
):

    stmt = select(Item).where(Item.user_id == user["userId"])
    items = session.exec(stmt).all()
    return items
