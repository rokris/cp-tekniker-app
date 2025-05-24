# ClearPass API logic: get_device_info, create_device, get_cached_token
from flask import Blueprint, request, jsonify, session, current_app as app
import requests
from datetime import datetime, timedelta
from config import Config

token_cache = {"token": None, "expiry": None}

bp = Blueprint('clearpass_api', __name__)

def get_cached_token():
    now = datetime.now()
    if token_cache["token"] and token_cache["expiry"] and token_cache["expiry"] > now:
        return token_cache["token"]
    token_url = f"{Config.BASE_URL}/api/oauth"
    try:
        resp = requests.post(
            token_url,
            data={
                "grant_type": "client_credentials",
                "client_id": Config.CLIENT_ID,
                "client_secret": Config.CLIENT_SECRET,
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

def get_device_info(macaddr):
    token = get_cached_token()
    if not token:
        return None, "Autentisering feilet."
    headers = {"Authorization": f"Bearer {token}"}
    api_url = f"{Config.BASE_URL}/api/device/mac/{macaddr}"
    try:
        resp = requests.get(api_url, headers=headers)
        resp.raise_for_status()
        return resp.json(), None
    except Exception as e:
        app.logger.error(f"API-forespørsel feilet: {e}")
        return None, "Kunne ikke hente enhetsinformasjon."

def create_device(payload):
    token = get_cached_token()
    if not token:
        return None, "Autentisering feilet."
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    api_url = f"{Config.BASE_URL}/api/device"
    try:
        resp = requests.post(api_url, headers=headers, json=payload)
        resp.raise_for_status()
        return resp.json(), None
    except Exception as e:
        app.logger.error(f"API-forespørsel feilet: {e}")
        return None, "Kunne ikke opprette enhet."

@bp.route('/get_device_info', methods=['GET'])
def device_info_route():
    if not session.get("logged_in") or not session.get("session_token"):
        return jsonify({"error": "Autentisering kreves."}), 401
    macaddr = request.args.get("macaddr")
    if not macaddr:
        return jsonify({"error": "MAC-adresse er påkrevd."}), 400
    device_info, error = get_device_info(macaddr)
    if error:
        return jsonify({"error": error}), 500
    return jsonify(device_info)

@bp.route('/create_device', methods=['POST'])
def create_device_route():
    if not session.get("logged_in") or not session.get("session_token"):
        return jsonify({"error": "Autentisering kreves."}), 401
    payload = request.json
    required_fields = ["mac", "role_id"]
    if not payload or any(f not in payload for f in required_fields):
        return jsonify({"error": f"Påkrevde felt mangler: {required_fields}"}), 400
    device, error = create_device(payload)
    if error:
        return jsonify({"error": error}), 500
    return jsonify(device), 201
