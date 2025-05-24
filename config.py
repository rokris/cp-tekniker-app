import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get("FLASK_SECRET_KEY", "dev_secret_key")
    SESSION_TYPE = "filesystem"
    SESSION_PERMANENT = True
    PERMANENT_SESSION_LIFETIME = 8 * 60 * 60  # 8 timer i sekunder
    SESSION_COOKIE_NAME = "session"
    BASE_URL = os.environ.get("BASE_URL")
    CLIENT_ID = os.environ.get("CLIENT_ID")
    CLIENT_SECRET = os.environ.get("CLIENT_SECRET")
    SMTP_SERVER = os.environ.get("SMTP_SERVER")
    SMTP_PORT = int(os.environ.get("SMTP_PORT", 25))
    SMTP_FROM = os.environ.get("SMTP_FROM")
    SMTP_FROM_NAME = os.environ.get("SMTP_FROM_NAME", "")
    REDIS_URL = os.environ.get("REDIS_URL", "redis://localhost:6379/0")
