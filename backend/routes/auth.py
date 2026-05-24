from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from sentry_sdk.integrations import fastapi
from database import SessionDep
from models import User

app = APIRouter(prefix="/auth")

class SignupData(BaseModel):
    name: str
    username: str
    email: str
    password: str
    passwordConfirmation: str

@app.post("/signup")
def signup(data: SignupData, session: SessionDep):
    if(data.password != data.passwordConfirmation):
        raise HTTPException(status_code=400, detail="Passwords do not match")
    user = User(username=data.username, email=data.email, name=data.name)
    session.add(user)
    session.commit()
    return user