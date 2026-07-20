from dotenv import load_dotenv
import redis
import os

load_dotenv()
redis_url = os.getenv("REDIS_URL", "")
redis_client = redis.Redis.from_url(redis_url, decode_responses=True)
