from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from flask_session import Session
import requests
import os
from datetime import timedelta
from dotenv import load_dotenv
import logging
import redis
import smtplib
from email.mime.text import MIMEText
import random

load_dotenv()

app = Flask(__name__)
app.secret_key = os.environ.get('FLASK_SECRET_KEY', 'dev_secret_key')  # Use a secure key in production
app.config['SESSION_TYPE'] = 'filesystem'  # Use server-side session storage
app.config['SESSION_PERMANENT'] = True
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=8)
# Remove SESSION_COOKIE_NAME config to avoid AttributeError with Flask-Session
Session(app)

app.logger.setLevel(logging.DEBUG)

# Configuration for Azure Function endpoints
AZURE_FUNCTION_BASE_URL = os.environ.get('AZURE_FUNCTION_BASE_URL', 'http://localhost:7071/api')

REDIS_URL = os.environ.get('REDIS_URL', 'redis://localhost:6379/0')
redis_client = redis.StrictRedis.from_url(REDIS_URL, decode_responses=True)

def generate_auth_code():
    return f"{random.randint(100,999)}-{random.randint(100,999)}"

def send_auth_code(email, code):
    smtp_server = os.environ.get('SMTP_SERVER')
    smtp_port = int(os.environ.get('SMTP_PORT', 25))
    from_addr = os.environ.get('SMTP_FROM')
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
    msg['From'] = from_addr
    msg['To'] = email
    try:
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.sendmail(from_addr, [email], msg.as_string())
        return True
    except Exception as e:
        app.logger.error(f"Failed to send email: {e}")
        return False

@app.route('/')
def home():
    if not session.get('logged_in'):
        return render_template('index.html', logged_in=False)
    return render_template('index.html', logged_in=True)

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email', '').strip() if data else ''
    code = data.get('code', '').strip() if data else ''
    app.logger.info(f"Login attempt for email: {email} with code: {code}")
    if not email or not code:
        app.logger.warning("Missing email or code in login request")
        return jsonify({'error': 'Email and code are required.'}), 400
    # Check code in Redis
    stored_code = redis_client.get(f"auth_code:{email}")
    if not stored_code:
        return jsonify({'error': 'No code requested for this email.'}), 400
    if code != stored_code:
        return jsonify({'error': 'Invalid code.'}), 401
    redis_client.delete(f"auth_code:{email}")
    session.permanent = True
    session['logged_in'] = True
    session['user_email'] = email
    # Generate a simple session token (for demo, use a random string)
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
        return jsonify({"error": "MAC address is required."}), 400
    try:
        response = requests.get(f"{AZURE_FUNCTION_BASE_URL}/GetDeviceInfo", params={"macaddr": macaddr})
        response.raise_for_status()
        return jsonify(response.json())
    except requests.RequestException as e:
        return jsonify({"error": "Failed to fetch device info.", "details": str(e)}), 500

@app.route('/create_device', methods=['POST'])
def create_device():
    if not session.get('logged_in') or not session.get('session_token'):
        return jsonify({'error': 'Authentication required.'}), 401
    try:
        payload = request.json
        response = requests.post(f"{AZURE_FUNCTION_BASE_URL}/CreateDevice", json=payload)
        response.raise_for_status()
        return jsonify(response.json()), 201
    except requests.RequestException as e:
        return jsonify({"error": "Failed to create device.", "details": str(e)}), 500

@app.route('/request_auth_code', methods=['POST'])
def request_auth_code():
    data = request.get_json()
    email = data.get('email', '').strip() if data else ''
    if not email:
        return jsonify({'error': 'Email is required.'}), 400
    code = generate_auth_code()
    # Store code in Redis for 10 minutes
    redis_client.setex(f"auth_code:{email}", 600, code)
    if send_auth_code(email, code):
        return jsonify({'message': 'Authentication code sent.'}), 200
    else:
        return jsonify({'error': 'Failed to send authentication code.'}), 500

@app.route('/verify_auth_code', methods=['POST'])
def verify_auth_code():
    data = request.get_json()
    email = data.get('email', '').strip() if data else ''
    code = data.get('code', '').strip() if data else ''
    if not email or not code:
        return jsonify({'error': 'Email and code are required.'}), 400
    try:
        response = requests.post(f"{AZURE_FUNCTION_BASE_URL}/VerifyAuthCode", json={"email": email, "code": code})
        response.raise_for_status()
        return jsonify({'message': 'Login successful.'}), 200
    except requests.RequestException as e:
        if response is not None and response.status_code == 401:
            return jsonify({'error': 'Invalid code.'}), 401
        if response is not None and response.status_code == 400:
            return jsonify({'error': response.text}), 400
        return jsonify({'error': 'Failed to verify authentication code.', 'details': str(e)}), 500

@app.route('/GetDeviceRoles', methods=['GET'])
def get_device_roles():
    if not session.get('logged_in') or not session.get('session_token'):
        return jsonify({'error': 'Authentication required.'}), 401
    try:
        response = requests.get(f"{AZURE_FUNCTION_BASE_URL}/GetDeviceRoles")
        response.raise_for_status()
        return jsonify(response.json()), 200
    except requests.RequestException as e:
        return jsonify({'error': 'Failed to fetch device roles.', 'details': str(e)}), 500

@app.route('/is_logged_in', methods=['GET'])
def is_logged_in():
    return jsonify({'logged_in': bool(session.get('logged_in'))})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8000)