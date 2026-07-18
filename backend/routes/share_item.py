from datetime import date
from typing import Any, Sequence, cast
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlmodel import col, select
from database import SessionDep
from models import ProductRequest, ShareItem, User
from utils import verifyUserTokenSession
from typing import Sequence, Any
from sqlmodel import select, func, cast, Float
from sqlalchemy.dialects.postgresql import JSONB
from fastapi import Query

app = APIRouter(prefix="/api/share-item")


class ShareItemData(BaseModel):
    name: str
    expiryDate: date
    weight: int
    notes: str
    location: str
    userId: int


@app.post("/")
def createShareItem(data: ShareItemData, session: SessionDep):
    shareItem = ShareItem(
        name=data.name,
        expiryDate=data.expiryDate,
        weight=data.weight,
        notes=data.notes,
        location=data.location,
        user_id=data.userId,
    )

    session.add(shareItem)
    session.commit()


class ShareItemResponse(BaseModel):
    id: int | None
    user_id: int
    name: str
    expiryDate: date  # Changed to date to match the DB type safely
    weight: int  # Changed to int to match the DB type safely
    notes: str | None = None
    location: str
    owner_id: int
    owner_username: str


@app.get(path="/", response_model=list[ShareItemResponse])
def getShareItems(
    session: SessionDep,
    searchTerm: str = Query(default=""),
    maxDistanceKm: int = Query(default=16),
    lng: float = Query(default=28.1900),
    lat: float = Query(default=45.9000),
    user: dict[Any, Any] = Depends(dependency=verifyUserTokenSession),
):

    user_lat = lat
    user_lng = lng

    db_lat = cast(
        func.jsonb_extract_path_text(cast(ShareItem.location, JSONB), "lat"), Float
    )
    db_lng = cast(
        func.jsonb_extract_path_text(cast(ShareItem.location, JSONB), "lng"), Float
    )
    inner_cos_calculation = func.cos(func.radians(user_lat)) * func.cos(
        func.radians(db_lat)
    ) * func.cos(func.radians(db_lng) - func.radians(user_lng)) + func.sin(
        func.radians(user_lat)
    ) * func.sin(func.radians(db_lat))

    bounded_calculation = func.least(1.0, func.greatest(-1.0, inner_cos_calculation))

    distance_formula = 6371 * func.acos(bounded_calculation)
    today = date.today()

    shareItemsStmt = (
        select(
            ShareItem,
            col(User.id).label("owner_id"),
            col(User.username).label("owner_username"),
        )
        .join(User, onclause=col(ShareItem.user_id) == col(User.id))
        .join(
            ProductRequest,
            onclause=col(ShareItem.id) == col(ProductRequest.share_item_id),
            isouter=True,
        )
        .where(
            ShareItem.user_id != user["userId"],
            distance_formula <= maxDistanceKm,
            col(ShareItem.expiryDate) >= today,
            col(ProductRequest.id) == None,
        )
    )
    if searchTerm.strip():
        search_pattern = f"%{searchTerm.strip()}%"
        shareItemsStmt = shareItemsStmt.where(
            col(ShareItem.name).ilike(search_pattern)
            | col(ShareItem.notes).ilike(search_pattern)
        )
    shareItems = session.exec(shareItemsStmt).all()
    formatted_items = []

    print(shareItems)
    for item, owner_id, owner_username in shareItems:
        formatted_items.append(
            ShareItemResponse(
                id=item.id,
                user_id=item.user_id,
                name=item.name,
                expiryDate=item.expiryDate,
                weight=item.weight,
                notes=item.notes,
                location=item.location,
                owner_id=owner_id,
                owner_username=owner_username,
            )
        )
    return formatted_items


@app.get("/user", response_model=list[ShareItem])
def get_owner_share_items(
    session: SessionDep,
    user: dict[Any, Any] = Depends(verifyUserTokenSession),
):
    statement = select(ShareItem).where(ShareItem.user_id == user["userId"])
    items = session.exec(statement).all()
    return items


class ShareItemWithRequest(BaseModel):
    share_item: ShareItem
    request: ProductRequest


@app.get("/requested", response_model=list[ShareItemWithRequest])
def get_requested_share_items(
    session: SessionDep, user: dict[Any, Any] = Depends(verifyUserTokenSession)
):
    statement = (
        select(ShareItem, ProductRequest)
        .join(
            ProductRequest,
            onclause=col(ShareItem.id) == col(ProductRequest.share_item_id),
        )
        .where(col(ProductRequest.requester_id) == user["userId"])
        .distinct()
    )

    items = session.exec(statement).all()
    return [ShareItemWithRequest(share_item=item, request=req) for item, req in items]


@app.patch("/{item_id}", response_model=ShareItem)
def update_share_item(
    item_id: int,
    item_update: dict[str, Any],
    session: SessionDep,
    user: dict[Any, Any] = Depends(verifyUserTokenSession),
):
    db_item = session.get(ShareItem, item_id)
    if not db_item:
        raise HTTPException(status_code=404, detail="Share item not found")

    if db_item.user_id != user["userId"]:
        raise HTTPException(
            status_code=403, detail="You do not have permission to edit this item"
        )

    for key, value in item_update.items():
        if hasattr(db_item, key):
            setattr(db_item, key, value)

    session.add(db_item)
    session.commit()
    session.refresh(db_item)
    return db_item


@app.delete("/{item_id}", status_code=status.HTTP_200_OK)
def delete_share_item(
    item_id: int,
    session: SessionDep,
    user: dict[Any, Any] = Depends(verifyUserTokenSession),
):
    db_item = session.get(ShareItem, item_id)
    if not db_item:
        raise HTTPException(status_code=404, detail="Share item not found")

    if db_item.user_id != user["userId"]:
        raise HTTPException(
            status_code=403, detail="You do not have permission to delete this item"
        )

    session.delete(db_item)
    session.commit()
    return {"message": "Item deleted successfully", "id": item_id}


def getShareItemById(item_id: int, session: SessionDep):
    db_item = session.get(ShareItem, item_id)
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    return db_item
