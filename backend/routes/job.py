from redis_client import redis_client
from fastapi import APIRouter, Depends
from utils import verifyUserTokenSession
import json

app = APIRouter(prefix="/api/job", dependencies=[Depends(verifyUserTokenSession)])


@app.get("/{job_id}")
def get_job_status(job_id: str):
    data = redis_client.get(f"job:{job_id}")
    if data:
        return json.loads(data)
    return {"status": "NOT_FOUND"}
