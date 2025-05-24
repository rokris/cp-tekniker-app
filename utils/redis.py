import redis
from config import Config

redis_client = redis.StrictRedis.from_url(Config.REDIS_URL, decode_responses=True)
