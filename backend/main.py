from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from database import init_db
from models import User, Item
from routes.auth import app as authRouter
from routes.user import app as userRouter
from routes.item import app as itemRouter

app = FastAPI()

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


@app.get("/")
def helloWorld():
    return "Hello World"
