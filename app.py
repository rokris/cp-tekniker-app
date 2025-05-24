import os
import random
import re
import smtplib
import json
from datetime import datetime, timedelta
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from flask import Flask, render_template, request, jsonify, session
from flask_session import Session
import requests
from dotenv import load_dotenv
import redis
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from redis import Redis
from flask_limiter.errors import RateLimitExceeded

load_dotenv()

app = Flask(__name__)
app.secret_key = os.environ.get("FLASK_SECRET_KEY", "dev_secret_key")
app.config["SESSION_TYPE"] = "filesystem"
app.config["SESSION_PERMANENT"] = True
app.config["PERMANENT_SESSION_LIFETIME"] = timedelta(hours=8)
app.config["SESSION_COOKIE_NAME"] = "session"
Session(app)

# Configuration for ClearPass API
BASE_URL = os.environ.get("BASE_URL")
CLIENT_ID = os.environ.get("CLIENT_ID")
CLIENT_SECRET = os.environ.get("CLIENT_SECRET")

# SMTP config
SMTP_SERVER = os.environ.get("SMTP_SERVER")
SMTP_PORT = int(os.environ.get("SMTP_PORT", 25))
SMTP_FROM = os.environ.get("SMTP_FROM")

# Redis config
REDIS_URL = os.environ.get("REDIS_URL", "redis://localhost:6379/0")
redis_client = redis.StrictRedis.from_url(REDIS_URL, decode_responses=True)

# Token cache
token_cache = {"token": None, "expiry": None}

limiter = Limiter(
    get_remote_address,
    app=app,
    storage_uri=REDIS_URL
    # Ikke sett default_limits hvis du vil ha ubegrenset som default
)


def get_cached_token():
    now = datetime.now()
    if token_cache["token"] and token_cache["expiry"] and token_cache["expiry"] > now:
        return token_cache["token"]
    token_url = f"{BASE_URL}/api/oauth"
    try:
        resp = requests.post(
            token_url,
            data={
                "grant_type": "client_credentials",
                "client_id": CLIENT_ID,
                "client_secret": CLIENT_SECRET,
            },
        )
        resp.raise_for_status()
        data = resp.json()
        token_cache["token"] = data.get("access_token")
        expires_in = data.get("expires_in", 3600)
        token_cache["expiry"] = now + timedelta(seconds=expires_in)
        return token_cache["token"]
    except Exception as e:
        app.logger.error(f"Kunne ikke hente token: {e}")
        return None


def load_approved_domains_and_emails():
    """Load pre-approved email domains and full email addresses from JSON file, with roles."""
    import os

    approved_path = os.path.join(
        os.path.dirname(os.path.abspath(__file__)), "approved_domains.json"
    )
    try:
        with open(approved_path, "r") as f:
            domain_data = json.load(f)
        approved_domains = []
        approved_emails = []
        for entry in domain_data:
            if "@" in entry["email"]:
                approved_emails.append(entry["email"].lower())
            else:
                approved_domains.append(entry["email"].lower())
        return approved_domains, approved_emails
    except Exception as e:
        app.logger.error(f"Kunne ikke laste godkjente domener: {e}")
        return [], []


def get_user_roles(email, domain_data=None):
    email = email.lower()
    import os

    approved_path = os.path.join(
        os.path.dirname(os.path.abspath(__file__)), "approved_domains.json"
    )
    try:
        with open(approved_path, "r") as f:
            full_domain_data = json.load(f)
        # Sjekk først eksakt e-post, deretter domene
        for entry in full_domain_data:
            if email == entry["email"]:
                return entry.get("roles", [])
        for entry in full_domain_data:
            if email.endswith("@" + entry["email"]):
                return entry.get("roles", [])
    except Exception as e:
        app.logger.error(f"Kunne ikke laste godkjente domener for roller: {e}")
    return []


def is_email_approved(email, approved_domains, approved_emails):
    email = email.lower()
    if email in approved_emails:
        return True
    match = re.match(r"^[^@]+@([^@]+)$", email)
    if not match:
        return False
    domain = match.group(1)
    return domain in approved_domains


def generate_auth_code():
    return f"{random.randint(100,999)}-{random.randint(100,999)}"


def send_auth_code(recipient_email, code):
    from_name = os.environ.get("SMTP_FROM_NAME", "")
    from email.message import EmailMessage
    import email.utils

    msg = EmailMessage()
    msg["Subject"] = "Din engangskode for innlogging til Aruba ClearPass"
    msg["From"] = email.utils.formataddr((from_name, SMTP_FROM))
    msg["To"] = recipient_email
    msg["List-Unsubscribe"] = (
        "<mailto:unsubscribe@ngdata.no?subject=unsubscribe-clearpass>"
    )
    msg["X-Mailer"] = "Python SMTP via ClearPass"

    text_part = f"""Hei!

Du har bedt om en engangskode for å logge inn i NorgesGruppens Aruba ClearPass administrasjonsløsning.

Din kode er: {code}

Denne koden er gyldig i 10 minutter og kan kun brukes én gang.

Hvis du ikke har bedt om denne koden, kan du se bort fra denne e-posten.

Med vennlig hilsen
NorgesGruppen Data AS
"""

    html_part = f"""<html>
  <body style="font-family: sans-serif; color: #333;">
    <p>Hei!</p>
    <p>Du har bedt om en engangskode for å logge inn i <strong>NorgesGruppens Aruba ClearPass administrasjonsløsning</strong>.</p>
    <p><strong>Din kode er:</strong></p>
    <p style="font-size: 1.5em; font-weight: bold; color: #005EB8;">{code}</p>
    <p>Koden er gyldig i <strong>10 minutter</strong> og kan kun brukes én gang.</p>
    <p>Hvis du ikke har bedt om denne koden, kan du se bort fra denne e-posten.</p>
    <p>Med vennlig hilsen,<br>NorgesGruppen Data AS</p>
  </body>
</html>
"""

    msg.set_content(text_part, subtype="plain", charset="utf-8")
    msg.add_alternative(html_part, subtype="html", charset="utf-8")

    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.send_message(msg)
        return True
    except Exception as e:
        app.logger.error(f"Kunne ikke sende e-post: {e}")
        return False


@app.route("/")
def home():
    return render_template("index.html", logged_in=session.get("logged_in", False))


@app.route("/request_auth_code", methods=["POST"])
@limiter.limit("5 per minute;20 per hour")
def request_auth_code():
    data = request.get_json()
    email = data.get("email", "").strip() if data else ""
    if not email:
        return jsonify({"error": "E-postadresse er påkrevd."}), 400
    approved_domains, approved_emails = load_approved_domains_and_emails()
    if not is_email_approved(email, approved_domains, approved_emails):
        return jsonify({"error": "E-postadresse eller domene er ikke godkjent."}), 403
    code = generate_auth_code()
    # Store code in Redis for 10 minutes
    redis_client.setex(f"auth_code:{email}", 600, code)
    if send_auth_code(email, code):
        return jsonify({"message": "Autentiseringskode sendt."}), 200
    else:
        return jsonify({"error": "Kunne ikke sende autentiseringskode."}), 500


@app.route("/login", methods=["POST"])
@limiter.limit("10 per minute;30 per hour")
def login():
    data = request.get_json()
    email = data.get("email", "").strip() if data else ""
    code = data.get("code", "").strip() if data else ""
    if not email or not code:
        return jsonify({"error": "E-postadresse og kode er påkrevd."}), 400
    stored_code = redis_client.get(f"auth_code:{email}")
    if not stored_code:
        return jsonify({"error": "Ingen kode er forespurt for denne e-postadressen."}), 400
    if code != stored_code:
        return jsonify({"error": "Ugyldig kode."}), 401
    redis_client.delete(f"auth_code:{email}")
    session.permanent = True
    session["logged_in"] = True
    session["user_email"] = email
    import secrets

    session["session_token"] = secrets.token_urlsafe(32)
    return (
        jsonify(
            {"message": "Innlogging vellykket.", "session_token": session["session_token"]}
        ),
        200,
    )


@app.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"message": "Logget ut."}), 200


@app.route("/get_device_info", methods=["GET"])
def get_device_info():
    if not session.get("logged_in") or not session.get("session_token"):
        return jsonify({"error": "Autentisering kreves."}), 401
    macaddr = request.args.get("macaddr")
    if not macaddr:
        return jsonify({"error": "MAC-adresse er påkrevd."}), 400
    token = get_cached_token()
    if not token:
        return jsonify({"error": "Autentisering feilet."}), 500
    headers = {"Authorization": f"Bearer {token}"}
    api_url = f"{BASE_URL}/api/device/mac/{macaddr}"
    try:
        resp = requests.get(api_url, headers=headers)
        resp.raise_for_status()
        return jsonify(resp.json())
    except Exception as e:
        app.logger.error(f"API-forespørsel feilet: {e}")
        return jsonify({"error": "Kunne ikke hente enhetsinformasjon."}), 500


@app.route("/create_device", methods=["POST"])
def create_device():
    if not session.get("logged_in") or not session.get("session_token"):
        return jsonify({"error": "Autentisering kreves."}), 401
    payload = request.json
    required_fields = ["mac", "role_id"]
    if not payload or any(f not in payload for f in required_fields):
        return jsonify({"error": f"Påkrevde felt mangler: {required_fields}"}), 400
    token = get_cached_token()
    if not token:
        return jsonify({"error": "Autentisering feilet."}), 500
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    api_url = f"{BASE_URL}/api/device"
    try:
        resp = requests.post(api_url, headers=headers, json=payload)
        resp.raise_for_status()
        return jsonify(resp.json()), 201
    except Exception as e:
        app.logger.error(f"API-forespørsel feilet: {e}")
        return jsonify({"error": "Kunne ikke opprette enhet."}), 500


@app.route("/GetDeviceRoles", methods=["GET"])
def get_device_roles():
    if not session.get("logged_in") or not session.get("session_token"):
        return jsonify({"error": "Autentisering kreves."}), 401
    token = get_cached_token()
    if not token:
        return jsonify({"error": "Autentisering feilet."}), 500
    headers = {"Authorization": f"Bearer {token}"}
    api_url = f"{BASE_URL}/api/role-mapping/name/[Guest Roles]"
    try:
        resp = requests.get(api_url, headers=headers)
        resp.raise_for_status()
        data = resp.json()
        # Filter roller basert på innlogget e-post
        domain_data = load_approved_domains_and_emails()
        user_email = session.get("user_email", "").lower()
        allowed_roles = get_user_roles(user_email, domain_data)
        allowed_role_ids = {str(r["role_id"]) for r in allowed_roles}
        roles = []
        rules = data.get("rules") if isinstance(data, dict) else data
        if rules is None:
            rules = []
        for rule in rules:
            role_name = rule.get("role_name") or rule.get("name")
            role_id = None
            if "role_id" in rule:
                role_id = str(rule["role_id"])
            else:
                conditions = rule.get("condition", [])
                for cond in conditions:
                    if isinstance(cond, dict) and "value" in cond:
                        role_id = str(cond["value"])
                        break
            if (
                role_name
                and role_id
                and (not allowed_role_ids or role_id in allowed_role_ids)
            ):
                roles.append({"name": role_name, "role_id": role_id})
        return jsonify(roles), 200
    except Exception as e:
        app.logger.error(f"API-forespørsel feilet: {e}")
        return jsonify({"error": "Kunne ikke hente enhetsroller."}), 500


@app.route("/is_logged_in", methods=["GET"])
def is_logged_in():
    return jsonify({"logged_in": bool(session.get("logged_in"))})


@app.errorhandler(RateLimitExceeded)
def handle_rate_limit(e):
    retry_after = None
    # Flask-Limiter 3.x: e.retry_after er alltid korrekt hvis satt
    if hasattr(e, 'retry_after') and e.retry_after:
        retry_after = int(e.retry_after)
    else:
        # Siste utvei: prøv å parse Retry-After header fra responsen
        retry_after_header = request.headers.get('Retry-After')
        if retry_after_header:
            try:
                retry_after = int(retry_after_header)
            except Exception:
                retry_after = None
        # Siste utvei: prøv å parse siste tall i e.description
        if retry_after is None:
            import re as _re
            match = _re.search(r'(\d+)$', str(e.description))
            if match:
                retry_after = int(match.group(1))
    # Hvis retry_after ikke er funnet, sett til 60 sekunder som fallback
    if retry_after is None:
        retry_after = 60
    message = f"Du har nådd grensen for antall forespørsler. Du kan prøve igjen om {retry_after} sekunder."
    return jsonify({
        "error": message,
        "retry_after": retry_after
    }), 429
