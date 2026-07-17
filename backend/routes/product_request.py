from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import and_, or_, select

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
    owner_id: int


@app.post("/")
def createProductRequest(
    data: ProductRequestData,
    session: SessionDep,
    user: dict[Any, Any] = Depends(verifyUserTokenSession),
):
    checkChatRoom(data.owner_id, session, user)
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
        owner_id=data.owner_id,
    )
    session.add(new_request)
    session.commit()
    session.refresh(new_request)

    return new_request


@app.get(path="/owner/{user_id}")
def getProductRequestsByOwnerId(
    requester_id: int,
    user_id: int,
    session: SessionDep,
    user: dict[Any, Any] = Depends(verifyUserTokenSession),
):

    statement = select(ProductRequest).where(
        or_(
            and_(
                ProductRequest.owner_id == user_id,
                ProductRequest.requester_id == requester_id,
            ),
            and_(
                ProductRequest.owner_id == requester_id,
                ProductRequest.requester_id == user_id,
            ),
        )
    )
    requests = session.exec(statement).all()
    return requests


class ProductRequestDetails(BaseModel):
    status: str


@app.put("/{id}")
def updateProductRequest(
    id: int,
    data: ProductRequestDetails,
    session: SessionDep,
    user: dict[Any, Any] = Depends(verifyUserTokenSession),
):
    request = session.get(ProductRequest, id)
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    if request.requester_id != user["userId"] and request.owner_id != user["userId"]:
        raise HTTPException(
            status_code=403, detail="You are not authorized to update this request"
        )
    print(RequestStatus.__members__)
    if data.status not in RequestStatus.__members__:
        raise HTTPException(status_code=400, detail="Invalid status")
    request.status = RequestStatus[data.status]
    session.commit()
    return request


@app.delete("/{id}")
def deleteProductRequest(
    id: int,
    session: SessionDep,
    user: dict[Any, Any] = Depends(verifyUserTokenSession),
):
    request = session.get(ProductRequest, id)
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    if request.requester_id != user["userId"] and request.owner_id != user["userId"]:
        raise HTTPException(
            status_code=403, detail="You are not authorized to delete this request"
        )
    session.delete(request)
    session.commit()
    return request
