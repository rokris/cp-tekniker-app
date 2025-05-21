import os
import random
import re
import smtplib
import json
from datetime import datetime, timedelta
from email.mime.text import MIMEText
from flask import Flask, render_template, request, jsonify, session
from flask_session import Session
import requests
from dotenv import load_dotenv
import redis

load_dotenv()

app = Flask(__name__)
app.secret_key = os.environ.get('FLASK_SECRET_KEY', 'dev_secret_key')
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_PERMANENT'] = True
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=8)
app.config['SESSION_COOKIE_NAME'] = 'session'
Session(app)

# Configuration for ClearPass API
BASE_URL = os.environ.get('BASE_URL')
CLIENT_ID = os.environ.get('CLIENT_ID')
CLIENT_SECRET = os.environ.get('CLIENT_SECRET')

# SMTP config
SMTP_SERVER = os.environ.get('SMTP_SERVER')
SMTP_PORT = int(os.environ.get('SMTP_PORT', 25))
SMTP_FROM = os.environ.get('SMTP_FROM')

# Redis config
REDIS_URL = os.environ.get('REDIS_URL', 'redis://localhost:6379/0')
redis_client = redis.StrictRedis.from_url(REDIS_URL, decode_responses=True)

# Token cache
token_cache = {'token': None, 'expiry': None}

def get_cached_token():
    now = datetime.now()
    if token_cache['token'] and token_cache['expiry'] and token_cache['expiry'] > now:
        return token_cache['token']
    token_url = f"{BASE_URL}/api/oauth"
    try:
        resp = requests.post(token_url, data={
            'grant_type': 'client_credentials',
            'client_id': CLIENT_ID,
            'client_secret': CLIENT_SECRET
        })
        resp.raise_for_status()
        data = resp.json()
        token_cache['token'] = data.get('access_token')
        expires_in = data.get('expires_in', 3600)
        token_cache['expiry'] = now + timedelta(seconds=expires_in)
        return token_cache['token']
    except Exception as e:
        app.logger.error(f"Failed to get token: {e}")
        return None

def load_approved_domains_and_emails():
    """Load pre-approved email domains and full email addresses from JSON file, with roles."""
    try:
        with open("approved_domains.json", "r") as f:
            domain_data = json.load(f)
        return domain_data
    except Exception as e:
        app.logger.error(f"Failed to load approved domains: {e}")
        return []

def get_user_roles(email, domain_data):
    email = email.lower()
    for entry in domain_data:
        if email == entry["email"]:
            return entry.get("roles", [])
        if email.endswith("@" + entry["email"]):
            return entry.get("roles", [])
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

def send_auth_code(email, code):
    msg = MIMEText(f"""
Hei!

Du har bedt om en engangskode for å logge inn i NorgesGruppen ClearPass administrasjonsløsning.

Din kode er: {code}

Denne koden er gyldig i 10 minutter og kan kun brukes én gang.

Hvis du ikke har bedt om denne koden, kan du se bort fra denne e-posten.

Med vennlig hilsen
NorgesGruppen Data AS
""", _charset="utf-8")
    msg['Subject'] = 'Din engangskode for innlogging'
    msg['From'] = SMTP_FROM
    msg['To'] = email
    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.sendmail(SMTP_FROM, [email], msg.as_string())
        return True
    except Exception as e:
        app.logger.error(f"Failed to send email: {e}")
        return False

@app.route('/')
def home():
    return render_template('index.html', logged_in=session.get('logged_in', False))

@app.route('/request_auth_code', methods=['POST'])
def request_auth_code():
    data = request.get_json()
    email = data.get('email', '').strip() if data else ''
    if not email:
        return jsonify({'error': 'Email is required.'}), 400
    approved_domains, approved_emails = load_approved_domains_and_emails()
    if not is_email_approved(email, approved_domains, approved_emails):
        return jsonify({'error': 'Email or domain is not approved.'}), 403
    code = generate_auth_code()
    # Store code in Redis for 10 minutes
    redis_client.setex(f"auth_code:{email}", 600, code)
    if send_auth_code(email, code):
        return jsonify({'message': 'Authentication code sent.'}), 200
    else:
        return jsonify({'error': 'Failed to send authentication code.'}), 500

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email', '').strip() if data else ''
    code = data.get('code', '').strip() if data else ''
    if not email or not code:
        return jsonify({'error': 'Email and code are required.'}), 400
    stored_code = redis_client.get(f"auth_code:{email}")
    if not stored_code:
        return jsonify({'error': 'No code requested for this email.'}), 400
    if code != stored_code:
        return jsonify({'error': 'Invalid code.'}), 401
    redis_client.delete(f"auth_code:{email}")
    session.permanent = True
    session['logged_in'] = True
    session['user_email'] = email
    import secrets
    session['session_token'] = secrets.token_urlsafe(32)
    return jsonify({'message': 'Login successful.', 'session_token': session['session_token']}), 200

@app.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': 'Logged out.'}), 200

@app.route('/get_device_info', methods=['GET'])
def get_device_info():
    if not session.get('logged_in') or not session.get('session_token'):
        return jsonify({'error': 'Authentication required.'}), 401
    macaddr = request.args.get('macaddr')
    if not macaddr:
        return jsonify({'error': 'MAC address is required.'}), 400
    token = get_cached_token()
    if not token:
        return jsonify({'error': 'Authentication failed.'}), 500
    headers = {'Authorization': f'Bearer {token}'}
    api_url = f"{BASE_URL}/api/device/mac/{macaddr}"
    try:
        resp = requests.get(api_url, headers=headers)
        resp.raise_for_status()
        return jsonify(resp.json())
    except Exception as e:
        app.logger.error(f"API request failed: {e}")
        return jsonify({'error': 'Failed to fetch device info.'}), 500

@app.route('/create_device', methods=['POST'])
def create_device():
    if not session.get('logged_in') or not session.get('session_token'):
        return jsonify({'error': 'Authentication required.'}), 401
    payload = request.json
    required_fields = ['mac', 'role_id']
    if not payload or any(f not in payload for f in required_fields):
        return jsonify({'error': f'Missing required fields: {required_fields}'}), 400
    token = get_cached_token()
    if not token:
        return jsonify({'error': 'Authentication failed.'}), 500
    headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}
    api_url = f"{BASE_URL}/api/device"
    try:
        resp = requests.post(api_url, headers=headers, json=payload)
        resp.raise_for_status()
        return jsonify(resp.json()), 201
    except Exception as e:
        app.logger.error(f"API request failed: {e}")
        return jsonify({'error': 'Failed to create device.'}), 500

@app.route('/GetDeviceRoles', methods=['GET'])
def get_device_roles():
    if not session.get('logged_in') or not session.get('session_token'):
        return jsonify({'error': 'Authentication required.'}), 401
    token = get_cached_token()
    if not token:
        return jsonify({'error': 'Authentication failed.'}), 500
    headers = {'Authorization': f'Bearer {token}'}
    api_url = f"{BASE_URL}/api/role-mapping/name/[Guest Roles]"
    try:
        resp = requests.get(api_url, headers=headers)
        resp.raise_for_status()
        data = resp.json()
        # Filter roller basert på innlogget e-post
        domain_data = load_approved_domains_and_emails()
        user_email = session.get('user_email', '').lower()
        allowed_roles = get_user_roles(user_email, domain_data)
        allowed_role_ids = {str(r['role_id']) for r in allowed_roles}
        roles = []
        rules = data.get('rules') if isinstance(data, dict) else data
        if rules is None:
            rules = []
        for rule in rules:
            role_name = rule.get('role_name') or rule.get('name')
            role_id = None
            if 'role_id' in rule:
                role_id = str(rule['role_id'])
            else:
                conditions = rule.get('condition', [])
                for cond in conditions:
                    if isinstance(cond, dict) and 'value' in cond:
                        role_id = str(cond['value'])
                        break
            if role_name and role_id and (not allowed_role_ids or role_id in allowed_role_ids):
                roles.append({'name': role_name, 'role_id': role_id})
        return jsonify(roles), 200
    except Exception as e:
        app.logger.error(f"API request failed: {e}")
        return jsonify({'error': 'Failed to fetch device roles.'}), 500

@app.route('/is_logged_in', methods=['GET'])
def is_logged_in():
    return jsonify({'logged_in': bool(session.get('logged_in'))})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
