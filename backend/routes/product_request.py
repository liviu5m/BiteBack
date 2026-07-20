from typing import Any, Optional

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import and_, or_, select

from brevo_email import sendBrevoEmail
from database import SessionDep
from models import ChatRoom, ProductRequest, RequestStatus, ShareItem, User
from routes.chat_room import checkChatRoom
from routes.share_item import getShareItemById
from routes.user import getUserById
from utils import verifyUserTokenSession

app = APIRouter(
    prefix="/api/product-request", dependencies=[Depends(verifyUserTokenSession)]
)


class ProductRequestData(BaseModel):
    user_id: int
    item_id: int
    owner_id: int
    item_name: str


@app.post("/")
def createProductRequest(
    data: ProductRequestData,
    session: SessionDep,
    background_tasks: BackgroundTasks,
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
    background_tasks.add_task(
        sendBrevoEmail,
        email=user["email"],
        name=user["name"],
        status=RequestStatus.PENDING,
        item_name=data.item_name,
    )
    # sendBrevoEmail(
    #     email=user["email"],
    #     name=user["name"],
    #     status=RequestStatus.PENDING,
    #     item_name=data.item_name,
    # )
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
    share_item_id: int
    requester_id: int


@app.put("/{id}")
def updateProductRequest(
    id: int,
    data: ProductRequestDetails,
    background_tasks: BackgroundTasks,
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

    if data.status not in RequestStatus.__members__:
        raise HTTPException(status_code=400, detail="Invalid status")

    share_item = getShareItemById(data.share_item_id, session)
    requester = getUserById(data.requester_id, session)
    is_reverted = (
        request.status == RequestStatus.ACCEPTED
        and RequestStatus[data.status] == RequestStatus.PENDING
    ) or (
        request.status == RequestStatus.COMPLETED
        and RequestStatus[data.status] == RequestStatus.PENDING
    )
    background_tasks.add_task(
        sendBrevoEmail,
        email=requester.email,
        name=requester.name,
        status=RequestStatus[data.status],
        item_name=share_item.name,
        is_reverted=is_reverted,
    )
    # sendBrevoEmail(
    #     email=requester.email,
    #     name=requester.name,
    #     status=RequestStatus[data.status],
    #     item_name=share_item.name,
    #     is_reverted=is_reverted,
    # )
    request.status = RequestStatus[data.status]
    session.commit()

    return request


@app.delete(path="/{id}")
def deleteProductRequest(
    id: int,
    session: SessionDep,
    background_tasks: BackgroundTasks,
    share_item_id: Optional[int] = None,
    requester_id: Optional[int] = None,
    user: dict[Any, Any] = Depends(dependency=verifyUserTokenSession),
) -> ProductRequest:
    request: ProductRequest | None = session.get(entity=ProductRequest, ident=id)
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    if request.requester_id != user["userId"] and request.owner_id != user["userId"]:
        raise HTTPException(
            status_code=403, detail="You are not authorized to delete this request"
        )

    session.delete(instance=request)
    session.commit()

    if share_item_id is not None and requester_id is not None:
        share_item: ShareItem = getShareItemById(item_id=share_item_id, session=session)
        requester: User = getUserById(userId=requester_id, session=session)
        background_tasks.add_task(
            sendBrevoEmail,
            email=requester.email,
            name=requester.name,
            status=request.status,
            item_name=share_item.name,
            is_declined=True,
        )
        # sendBrevoEmail(
        #     email=requester.email,
        #     name=requester.name,
        #     status=request.status,
        #     item_name=share_item.name,
        #     is_declined=True,
        # )

    return request
