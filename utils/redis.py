"""
Redis-klient for caching og rate limiting.
Brukes av Flask-Limiter og for midlertidig lagring av autentiseringskoder.
"""

import redis
from config import Config

# Initialiserer Redis-klient basert på URL fra config
redis_client = redis.StrictRedis.from_url(Config.REDIS_URL, decode_responses=True)
