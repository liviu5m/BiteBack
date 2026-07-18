from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from starlette.middleware.sessions import SessionMiddleware
from database import init_db
from models import User, Item, Recipe, ShareItem, ChatRoom, Message, ProductRequest
from routes.auth import app as authRouter
from routes.user import app as userRouter
from routes.item import app as itemRouter
from routes.recipe import app as recipeRouter
from routes.job import app as jobRouter
from routes.share_item import app as shareItemRouter
from routes.chat_room import app as chatRoomRouter
from routes.product_request import app as productRequestRouter

app = FastAPI()
SECRET_KEY = os.getenv("SECRET_KEY", "secret")
app.add_middleware(SessionMiddleware, secret_key=SECRET_KEY)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()

app.include_router(authRouter)
app.include_router(userRouter)
app.include_router(itemRouter)
app.include_router(recipeRouter)
app.include_router(jobRouter)
app.include_router(shareItemRouter)
app.include_router(chatRoomRouter)
app.include_router(productRequestRouter)


@app.get("/")
def helloWorld():
    return "Hello World"
