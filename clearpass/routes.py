# ClearPass extra routes: GetDeviceRoles
from flask import Blueprint, jsonify, session
from .api import get_cached_token
import requests
from .roles import load_approved_domains_and_emails, get_user_roles

bp = Blueprint('clearpass_routes', __name__)

@bp.route('/GetDeviceRoles', methods=['GET'])
def get_device_roles():
    if not session.get("logged_in") or not session.get("session_token"):
        return jsonify({"error": "Autentisering kreves."}), 401
    token = get_cached_token()
    if not token:
        return jsonify({"error": "Autentisering feilet."}), 500
    headers = {"Authorization": f"Bearer {token}"}
    from config import Config
    api_url = f"{Config.BASE_URL}/api/role-mapping/name/[Guest Roles]"
    try:
        resp = requests.get(api_url, headers=headers)
        resp.raise_for_status()
        data = resp.json()
        import os, json
        approved_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "approved_domains.json")
        with open(approved_path, "r") as f:
            full_domain_data = json.load(f)
        user_email = session.get("user_email", "").lower()
        allowed_roles = get_user_roles(user_email, full_domain_data)
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
        from flask import current_app as app
        app.logger.error(f"API-forespørsel feilet: {e}")
        return jsonify({"error": "Kunne ikke hente enhetsroller."}), 500
