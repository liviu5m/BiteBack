from typing import Annotated, Any, List, Optional
from sqlalchemy.orm import aliased
from sqlmodel import select
from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from sqlalchemy.orm import joinedload
from sqlmodel import select, col

from database import SessionDep
from models import ChatRoom, Message, User
from utils import verify_websocket_token, verifyUserTokenSession
import json

app = APIRouter(
    prefix="/api/chat-room",
)


class ConnectionManager:
    def __init__(self):
        self.active_rooms = {}

    async def connect(self, websocket: WebSocket, room_id: int):
        await websocket.accept()
        if room_id not in self.active_rooms:
            self.active_rooms[room_id] = set()
        self.active_rooms[room_id].add(websocket)

    def disconnect(self, websocket: WebSocket, room_id: int):
        if room_id in self.active_rooms:
            self.active_rooms[room_id].discard(websocket)

    async def broadcast(self, room_id: int, payload: dict):
        if room_id in self.active_rooms:
            for connection in self.active_rooms[room_id]:
                await connection.send_text(json.dumps(payload, default=str))


manager = ConnectionManager()


class ChatRoomWithUsernames(BaseModel):
    id: int
    user_one_id: int
    user_two_id: int
    user_one_username: str
    user_two_username: str


@app.get("/rooms/{user_id}")
def get_user_chat_rooms(
    user_id: int,
    db: SessionDep,
    current_user: Annotated[dict, Depends(verifyUserTokenSession)],
):
    U1 = aliased(User)
    U2 = aliased(User)

    statement = (
        select(ChatRoom, U1.username, U2.username)
        .join(U1, ChatRoom.user_one_id == U1.id)
        .join(U2, ChatRoom.user_two_id == U2.id)
        .where((ChatRoom.user_one_id == user_id) | (ChatRoom.user_two_id == user_id))
    )

    results = db.exec(statement).all()

    return [
        {
            "id": room.id,
            "user_one_id": room.user_one_id,
            "user_two_id": room.user_two_id,
            "user_one_username": u1_name,
            "user_two_username": u2_name,
        }
        for room, u1_name, u2_name in results
    ]


@app.get("/history/{room_id}")
def get_message_history(
    room_id: int,
    db: SessionDep,
    current_user: Annotated[dict, Depends(verifyUserTokenSession)],
):
    statement = (
        select(Message)
        .where(Message.chat_room_id == room_id)
        .order_by(col(Message.createdAt))
    )
    return db.exec(statement).all()


@app.websocket("/ws/{room_id}/{user_id}")
async def websocket_chat_endpoint(
    websocket: WebSocket,
    room_id: int,
    user_id: int,
    db: SessionDep,
    current_user: Annotated[dict, Depends(verify_websocket_token)],
):
    await manager.connect(websocket, room_id)
    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)

            new_msg = Message(
                chat_room_id=room_id, sender_id=user_id, text=message_data["text"]
            )
            db.add(new_msg)
            db.commit()
            db.refresh(new_msg)

            await manager.broadcast(
                room_id,
                {
                    "id": new_msg.id,
                    "sender_id": new_msg.sender_id,
                    "text": new_msg.text,
                    "createdAt": new_msg.createdAt,
                },
            )
    except WebSocketDisconnect:
        manager.disconnect(websocket, room_id)


@app.post("/")
def checkChatRoom(
    user_id: int,
    session: SessionDep,
    user: dict[Any, Any] = Depends(verifyUserTokenSession),
):
    u1, u2 = sorted([user["userId"], user_id])

    statement = (
        select(ChatRoom)
        .where(ChatRoom.user_one_id == u1)
        .where(ChatRoom.user_two_id == u2)
    )
    existing_room = session.exec(statement).first()

    if existing_room:
        return existing_room.id

    new_room = ChatRoom(user_one_id=u1, user_two_id=u2)
    session.add(new_room)
    session.commit()
    session.refresh(new_room)
    return new_room.id
