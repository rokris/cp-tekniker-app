from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from config import Config

limiter = Limiter(
    get_remote_address,
    storage_uri=Config.REDIS_URL
)
