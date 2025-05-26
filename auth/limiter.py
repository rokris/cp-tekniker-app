"""
Rate limiting-oppsett for autentiseringsendepunkter.
Bruker Redis som backend for å støtte distribuerte miljøer og flere prosesser.
"""

from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from config import Config
from utils.redis import redis_client

# Initialiserer Flask-Limiter med Redis-backend
limiter = Limiter(
    get_remote_address,
    storage_uri=Config.REDIS_URL
)
