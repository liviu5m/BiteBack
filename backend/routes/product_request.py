from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import select

from database import SessionDep
from models import ChatRoom, ProductRequest, RequestStatus, ShareItem
from routes.chat_room import checkChatRoom
from utils import verifyUserTokenSession

app = APIRouter(
    prefix="/api/product-request", dependencies=[Depends(verifyUserTokenSession)]
)


class ProductRequestData(BaseModel):
    user_id: int
    item_id: int


@app.post("/")
def createProductRequest(
    data: ProductRequestData,
    session: SessionDep,
    user: dict[Any, Any] = Depends(verifyUserTokenSession),
):
    checkChatRoom(data.user_id, session, user)
    item = session.get(ShareItem, data.item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Share item not found")

    if item.user_id == user["userId"]:
        raise HTTPException(status_code=400, detail="You cannot request your own item")

    session.add(item)

    new_request = ProductRequest(
        share_item_id=data.item_id,
        requester_id=user["userId"],
        status=RequestStatus.PENDING,
    )
    session.add(new_request)
    session.commit()
    session.refresh(new_request)

    return new_request
