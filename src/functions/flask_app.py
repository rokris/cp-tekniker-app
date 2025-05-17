from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from flask_session import Session
import requests
import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.secret_key = os.environ.get('FLASK_SECRET_KEY', 'dev_secret_key')  # Use a secure key in production
app.config['SESSION_TYPE'] = 'filesystem'  # Use server-side session storage
app.config['SESSION_PERMANENT'] = True
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=8)
app.config['SESSION_COOKIE_NAME'] = 'session'  # Explicitly set session cookie name for Flask-Session compatibility
Session(app)

# Configuration for Azure Function endpoints
AZURE_FUNCTION_BASE_URL = os.environ.get('AZURE_FUNCTION_BASE_URL', 'http://localhost:7071/api')

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
    if not email or not code:
        return jsonify({'error': 'Email and code are required.'}), 400
    try:
        response = requests.post(f"{AZURE_FUNCTION_BASE_URL}/VerifyAuthCode", json={"email": email, "code": code})
        response.raise_for_status()
        session.permanent = True
        session['logged_in'] = True
        session['user_email'] = email
        # Generate a simple session token (for demo, use a random string)
        import secrets
        session['session_token'] = secrets.token_urlsafe(32)
        return jsonify({'message': 'Login successful.', 'session_token': session['session_token']}), 200
    except requests.RequestException as e:
        session['logged_in'] = False
        if response is not None and response.status_code == 401:
            return jsonify({'error': 'Invalid code.'}), 401
        if response is not None and response.status_code == 400:
            return jsonify({'error': response.text}), 400
        return jsonify({'error': 'Failed to verify authentication code.', 'details': str(e)}), 500

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
    # Call Azure Function to request auth code
    try:
        response = requests.post(f"{AZURE_FUNCTION_BASE_URL}/RequestAuthCode", json={"email": email})
        response.raise_for_status()
        return jsonify({'message': 'Authentication code sent.'}), 200
    except requests.RequestException as e:
        if response is not None and response.status_code == 403:
            return jsonify({'error': 'Email domain is not approved.'}), 403
        return jsonify({'error': 'Failed to send authentication code.', 'details': str(e)}), 500

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

if __name__ == '__main__':
    app.run(debug=True)