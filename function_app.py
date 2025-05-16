import azure.functions as func
import datetime
import logging
import requests
from azure.functions import HttpResponse

# Configuration variables for ClearPass API
BASE_URL = "https://clearpass.ngdata.no"
CLIENT_ID = "app"
CLIENT_SECRET = "jZZbT2Wnut4OoxcIuxrWN9SQP9cOuTxKTeRnC8lDPFOm"

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

app = func.FunctionApp()

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