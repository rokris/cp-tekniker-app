import azure.functions as func
import datetime
import logging
import requests
from azure.functions import HttpResponse
import random
import smtplib
from email.mime.text import MIMEText
import re
from dotenv import load_dotenv
import os
import json

# Load environment variables from .env file
load_dotenv()

# Configuration variables for ClearPass API
BASE_URL = os.environ["BASE_URL"]
CLIENT_ID = os.environ["CLIENT_ID"]
CLIENT_SECRET = os.environ["CLIENT_SECRET"]

# Token cache
cached_token = None
cached_token_expiry = None

# Function to get OAuth2 token with caching
def get_cached_token():
    global cached_token, cached_token_expiry

    # Check if token is cached and still valid
    if cached_token and cached_token_expiry and cached_token_expiry > datetime.datetime.now():
        return cached_token

    # Retrieve new token
    token_url = f"{BASE_URL}/api/oauth"
    try:
        token_response = requests.post(
            token_url,
            data={
                "grant_type": "client_credentials",
                "client_id": CLIENT_ID,
                "client_secret": CLIENT_SECRET
            }
        )
        token_response.raise_for_status()
        token_data = token_response.json()
        cached_token = token_data.get("access_token")
        expires_in = token_data.get("expires_in", 3600)  # Default to 1 hour if not provided
        cached_token_expiry = datetime.datetime.now() + datetime.timedelta(seconds=expires_in)
        return cached_token
    except requests.RequestException as e:
        logging.error(f"Failed to retrieve access token: {e}")
        return None

# Add CORS headers to responses
def add_cors_headers(response: HttpResponse) -> HttpResponse:
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    return response

def generate_auth_code():
    """Generate a random 6-digit code in the format 123-123."""
    part1 = random.randint(100, 999)
    part2 = random.randint(100, 999)
    return f"{part1}-{part2}"

def load_approved_domains_and_emails():
    """Load pre-approved email domains and full email addresses from JSON file, with roles."""
    import os
    approved_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'approved_domains.json')
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
        logging.error(f"Failed to load approved domains: {e}")
        return [], []

def get_user_roles(email, domain_data=None):
    email = email.lower()
    import os
    approved_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'approved_domains.json')
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
        logging.error(f"Failed to load approved domains for roles: {e}")
    return []

def is_email_approved(email, approved_domains, approved_emails):
    """Check if the email is in the approved list (full address or domain)."""
    email = email.lower()
    if email in approved_emails:
        return True
    match = re.match(r"^[^@]+@([^@]+)$", email)
    if not match:
        return False
    domain = match.group(1)
    return domain in approved_domains

def send_auth_code(email, code):
    """Send the authentication code to the user's email address using plain SMTP (no encryption)."""
    smtp_server = os.environ["SMTP_SERVER"]
    smtp_port = int(os.environ["SMTP_PORT"])
    from_addr = os.environ["SMTP_FROM"]
    msg = MIMEText(f"""
Hei!

Du har bedt om en engangskode for å logge inn i NorgesGruppen ClearPass administrasjonsløsning.

Din kode er: {code}

Denne koden er gyldig i 10 minutter og kan kun brukes én gang.

Hvis du ikke har bedt om denne koden, kan du se bort fra denne e-posten.

Med vennlig hilsen
NorgesGruppen Data AS
""", _charset="utf-8")
    msg["Subject"] = "Din engangskode for innlogging"
    msg["From"] = from_addr
    msg["To"] = email
    try:
        logging.debug(f"SMTP debug: server={smtp_server}, port={smtp_port}, from={from_addr}, to={email}")
        logging.debug(f"SMTP debug: message=\n{msg.as_string()}")
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            # No encryption, no login required
            server.set_debuglevel(1)
            server.sendmail(from_addr, [email], msg.as_string())
        return True
    except Exception as e:
        logging.error(f"Failed to send email: {e}")
        return False

app = func.FunctionApp()

# In-memory store for auth codes (for demo only; use persistent store in production)
auth_code_store = {}

@app.route(route="GetDeviceInfo", methods=["GET", "OPTIONS"])
def GetDeviceInfo(req: func.HttpRequest) -> func.HttpResponse:
    if req.method == "OPTIONS":
        # Handle preflight request for CORS
        return add_cors_headers(HttpResponse("", status_code=204))

    logging.info(f"GetDeviceInfo processed a request at {datetime.datetime.now()}")

    # Extract MAC address parameter
    macaddr = req.params.get('macaddr')
    if not macaddr:
        return add_cors_headers(func.HttpResponse("MAC address is required.", status_code=400))

    # Get cached token
    access_token = get_cached_token()
    if not access_token:
        return add_cors_headers(func.HttpResponse("Authentication failed.", status_code=500))

    headers = {"Authorization": f"Bearer {access_token}"}

    # API request
    api_url = f"{BASE_URL}/api/device/mac/{macaddr}"

    try:
        api_response = requests.get(api_url, headers=headers)
        api_response.raise_for_status()
        return add_cors_headers(func.HttpResponse(api_response.text, status_code=200))
    except requests.RequestException as e:
        logging.error(f"API request failed: {e}")
        return add_cors_headers(func.HttpResponse("Failed to fetch data from API.", status_code=500))

@app.route(route="CreateDevice", methods=["POST"])
def CreateDevice(req: func.HttpRequest) -> func.HttpResponse:
    logging.info(f"CreateDevice processed a request at {datetime.datetime.now()}")

    # Parse request body
    try:
        req_body = req.get_json()
    except ValueError:
        return func.HttpResponse("Invalid JSON payload.", status_code=400)

    # Required fields based on DeviceReplace API
    required_fields = ["mac", "role_id"]
    missing_fields = [field for field in required_fields if field not in req_body]
    if missing_fields:
        return func.HttpResponse(f"Missing required fields: {', '.join(missing_fields)}", status_code=400)

    # Get cached token
    access_token = get_cached_token()
    if not access_token:
        return func.HttpResponse("Authentication failed.", status_code=500)

    headers = {"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"}

    # API request to create device
    api_url = f"{BASE_URL}/api/device"

    try:
        api_response = requests.post(api_url, headers=headers, json=req_body)
        api_response.raise_for_status()
        return func.HttpResponse(api_response.text, status_code=201)
    except requests.RequestException as e:
        logging.error(f"API request failed: {e}")
        return func.HttpResponse("Failed to create device.", status_code=500)

@app.route(route="RequestAuthCode", methods=["POST"])
def RequestAuthCode(req: func.HttpRequest) -> func.HttpResponse:
    try:
        req_body = req.get_json()
        email = req_body.get("email", "").strip()
    except Exception:
        return func.HttpResponse("Invalid JSON payload.", status_code=400)
    if not email:
        return func.HttpResponse("Email is required.", status_code=400)
    approved_domains, approved_emails = load_approved_domains_and_emails()
    if not is_email_approved(email, approved_domains, approved_emails):
        return func.HttpResponse("Email or domain is not approved.", status_code=403)
    code = generate_auth_code()
    # Store the code with a 10-minute expiry
    expiry = datetime.datetime.now() + datetime.timedelta(minutes=10)
    auth_code_store[email] = (code, expiry)
    logging.info(f"Auth code for {email}: {code}")
    if send_auth_code(email, code):
        return func.HttpResponse("Authentication code sent.", status_code=200)
    else:
        return func.HttpResponse("Failed to send authentication code.", status_code=500)

@app.route(route="VerifyAuthCode", methods=["POST"])
def VerifyAuthCode(req: func.HttpRequest) -> func.HttpResponse:
    try:
        req_body = req.get_json()
        email = req_body.get("email", "").strip()
        code = req_body.get("code", "").strip()
    except Exception:
        return func.HttpResponse("Invalid JSON payload.", status_code=400)
    if not email or not code:
        return func.HttpResponse("Email and code are required.", status_code=400)
    stored = auth_code_store.get(email)
    if not stored:
        return func.HttpResponse("No code requested for this email.", status_code=400)
    stored_code, expiry = stored
    if datetime.datetime.now() > expiry:
        del auth_code_store[email]
        return func.HttpResponse("Code expired.", status_code=400)
    if code != stored_code:
        return func.HttpResponse("Invalid code.", status_code=401)
    # On success, create a session token (for demo, just return success)
    del auth_code_store[email]
    return func.HttpResponse("Login successful.", status_code=200)

@app.route(route="GetDeviceRoles", methods=["GET", "OPTIONS"])
def GetDeviceRoles(req: func.HttpRequest) -> func.HttpResponse:
    if req.method == "OPTIONS":
        return add_cors_headers(HttpResponse("", status_code=204))
    logging.info(f"GetDeviceRoles processed a request at {datetime.datetime.now()}")
    # Get cached token
    access_token = get_cached_token()
    if not access_token:
        return add_cors_headers(func.HttpResponse("Authentication failed.", status_code=500))
    headers = {"Authorization": f"Bearer {access_token}"}
    api_url = f"{BASE_URL}/api/role-mapping/name/[Guest Roles]"
    try:
        api_response = requests.get(api_url, headers=headers)
        api_response.raise_for_status()
        data = api_response.json()
        # Hent e-post fra header eller query (for demo, bruk X-User-Email header hvis satt)
        user_email = req.headers.get('X-User-Email', '').lower()
        domain_data = load_approved_domains_and_emails()
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
        return add_cors_headers(func.HttpResponse(json.dumps(roles), status_code=200, mimetype="application/json"))
    except Exception as e:
        logging.error(f"API request failed: {e}")
        return add_cors_headers(func.HttpResponse("Failed to fetch roles from API.", status_code=500))