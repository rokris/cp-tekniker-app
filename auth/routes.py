# Authentication routes for login, request_auth_code, logout
from flask import Blueprint, request, jsonify, session
from .utils import send_auth_code, generate_auth_code, is_email_approved
from .limiter import limiter
from utils.redis import redis_client
from clearpass.roles import load_approved_domains_and_emails

bp = Blueprint('auth', __name__)

@bp.route('/request_auth_code', methods=['POST'])
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
    redis_client.setex(f"auth_code:{email}", 600, code)
    if send_auth_code(email, code):
        return jsonify({"message": "Autentiseringskode sendt."}), 200
    else:
        return jsonify({"error": "Kunne ikke sende autentiseringskode."}), 500

@bp.route('/login', methods=['POST'])
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
    return jsonify({"message": "Innlogging vellykket.", "session_token": session["session_token"]}), 200

@bp.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({"message": "Logget ut."}), 200
