from fastapi import APIRouter
from pydantic import BaseModel
from database import SessionDep
from models import Item, ItemCategory


app = APIRouter(prefix="/api/item")


class ItemData(BaseModel):
    name: str
    days: int
    category: ItemCategory
    weight: int


@app.post("/")
def createItem(data: ItemData, session: SessionDep):
    item = Item(
        name=data.name, days=data.days, category=data.category, weight=data.weight
    )
    session.add(item)
    session.commit()
    session.refresh(item)
    return item
