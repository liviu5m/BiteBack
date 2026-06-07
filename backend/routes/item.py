from typing import Any
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlmodel import col, select
from ai import getProductMatchingItems
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


@app.put("/{id}")
def updateItem(
    id: int,
    data: ItemData,
    session: SessionDep,
    user: dict = Depends(verifyUserTokenSession),
):

    stmt = select(Item).where(Item.id == id)
    item = session.exec(stmt).one_or_none()

    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    item.name = data.name
    item.days = data.days
    item.category = data.category
    item.weight = data.weight
    session.add(item)
    session.commit()
    session.refresh(item)
    return item


@app.delete("/{id}")
def deleteItem(id: int, session: SessionDep):
    stmt = select(Item).where(Item.id == id)
    item = session.exec(stmt).one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    session.delete(item)
    session.commit()
    return "Item deleted successfully"


@app.get("/")
def getItemByUserId(
    session: SessionDep, user: dict[Any, Any] = Depends(verifyUserTokenSession)
):

    stmt = select(Item).where(Item.user_id == user["userId"])
    items = session.exec(stmt).all()
    return items


@app.get("/ids")
def getItemsByIds(session: SessionDep, ids: list[int] = Query(default=[])):
    if not ids:
        return []
    stmt = select(Item).where(col(Item.id).in_(ids))
    items = session.exec(stmt).all()
    return items


@app.get("/food/{tab}")
def getProductByMatches(
    tab: str, session: SessionDep, ids: list[int] = Query(default=[])
):
    if not ids:
        return []
    stmt = select(Item).where(col(Item.id).in_(ids))
    items = session.exec(stmt).all()
    return getProductMatchingItems(list(items), tab)
