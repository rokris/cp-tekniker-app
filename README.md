# CP-Tekniker Device Management App

This project is a web-based device management application built with Flask (Python) and Azure Functions. It allows users to fetch device information and create new device entries using a simple web interface. The backend leverages Azure Functions for scalable, serverless API endpoints.

## Features
- **Get Device Info:** Query device details by MAC address.
- **Create Device:** Submit new device data via JSON payload.
- **Modern UI:** Clean, responsive web interface.
- **Azure Integration:** Uses Azure Functions for backend logic.

## How It Works
- The Flask app (`src/functions/flask_app.py`) serves the web UI and acts as a proxy to Azure Functions.
- The web UI (`src/functions/templates/index.html`) lets users input a MAC address or device JSON payload.
- When a user submits a request, the Flask app forwards it to the appropriate Azure Function endpoint (e.g., `/GetDeviceInfo`, `/CreateDevice`).
- Azure Functions process the request and return the result, which is displayed in the web UI.

## Project Structure
```
function_app.py           # Azure Functions entry point
host.json                 # Azure Functions host configuration
local.settings.json       # Local settings for Azure Functions
requirements.txt          # Python dependencies
src/functions/flask_app.py# Flask web server
src/functions/templates/  # HTML templates for Flask
```

## Prerequisites
- Python 3.8+
- [Azure Functions Core Tools](https://docs.microsoft.com/azure/azure-functions/functions-run-local) (for local development)
- [Node.js & npm](https://nodejs.org/) (if using JavaScript/TypeScript Azure Functions)
- macOS (but works cross-platform)

## Setup & Usage
1. **Clone the repository:**
   ```zsh
   git clone <your-repo-url>
   cd cp-tekniker-app
   ```
2. **Install Python dependencies:**
   ```zsh
   pip install -r requirements.txt
   ```
3. **Start Azure Functions host:**
   ```zsh
   func start
   ```
   This will run your Azure Functions locally at `http://localhost:7071`.
4. **Run the Flask app:**
   ```zsh
   python src/functions/flask_app.py
   ```
   The web UI will be available at `http://127.0.0.1:5000`.

## Usage Example
- **Get Device Info:**
  1. Enter a MAC address in the input field.
  2. Click "Fetch Info" to retrieve device details from Azure Functions.
- **Create Device:**
  1. Enter a valid JSON payload in the textarea. Example:
     ```json
     {
       "mac": "EE-BB-CC-AA-BB-CC",
       "role_id": "3228",
       "enabled": true,
       "sponsor_name": "roger",
       "sponsor_profile": "1",
       "expire_time": 0,
       "visitor_name": "TEST Device"
     }
     ```
  2. Click "Create Device" to submit the data to Azure Functions.

## Configuration
- Update `AZURE_FUNCTION_BASE_URL` in `flask_app.py` if your Azure Functions are hosted externally.
- Use `local.settings.json` to manage local Azure Function settings.

## Security & Best Practices
- No credentials are hardcoded; use Azure Managed Identity or Key Vault for secrets in production.
- Error handling is implemented for all API calls.
- Logging and monitoring should be enabled in production deployments.

## Session Management & Security
- User authentication is required for all device actions. Login is performed via email and a one-time code sent to your email address.
- Sessions are managed server-side using Flask-Session with filesystem storage. Sessions last for 8 hours or until the user logs out.
- The logout button in the web UI will immediately end the session.
- Both the Flask app and Azure Functions backend must be running for the application to work.

## How to Run
1. **Start the Azure Functions backend:**
   ```zsh
   func start
   ```
   This will run your Azure Functions locally at `http://localhost:7071`.
2. **Start the Flask app:**
   ```zsh
   python3 src/functions/flask_app.py
   ```
   The web UI will be available at `http://127.0.0.1:5000`.

## Requirements
- All dependencies are listed in `requirements.txt`, including `Flask-Session` for server-side session support. Install with:
   ```zsh
   pip install -r requirements.txt
   ```

## References
- [Azure Functions Python Developer Guide](https://docs.microsoft.com/azure/azure-functions/functions-reference-python)
- [Flask Documentation](https://flask.palletsprojects.com/)

## Design & Architecture
- **Frontend:** Flask web app (`src/functions/flask_app.py`) serves the web UI and proxies requests to backend APIs.
- **Backend:** Azure Functions (`function_app.py`) provide device management and authentication endpoints.
- **Configuration:** All secrets, URLs, and credentials are stored in a `.env` file and loaded using `python-dotenv`. No secrets or URLs are hardcoded in the source code.
- **Session Management:** User sessions are managed server-side using Flask-Session with filesystem storage. Sessions last 8 hours or until logout.
- **Authentication:** Login is required for all device actions. Users authenticate via email and a one-time code sent to their email address. Only pre-approved email domains are allowed (see `approved_domains.json`).
- **Email Delivery:** SMTP settings are loaded from the `.env` file. No credentials are hardcoded.

## Security
- **No hardcoded secrets:** All sensitive values (API URLs, client secrets, SMTP settings, Flask secret key) are loaded from environment variables in `.env`.
- **Session security:** Flask's `FLASK_SECRET_KEY` is used to sign session cookies. Use a strong, random value in production.
- **Access control:** All device management endpoints require authentication. Sessions are server-side and expire after 8 hours or on logout.
- **Email domain allow-list:** Only users with emails or domains listed in `approved_domains.json` can authenticate.
- **Logging:** All authentication and API errors are logged for audit and troubleshooting.

## Usage
1. **Configure environment:**
   - Copy `.env.example` to `.env` and fill in all required values (see below for keys).
   - Add your allowed email domains and roles to `approved_domains.json` using the following format:

```json
[
  {
    "email": "norgesgruppen.no",
    "roles": [
      { "role_id": 1, "role_name": "Admin" },
      { "role_id": 3, "role_name": "Viewer" }
    ]
  },
  {
    "email": "rokris@hotmail.com",
    "roles": [
      { "role_id": 2, "role_name": "Editor" }
    ]
  }
]
```
2. **Install dependencies:**
   ```zsh
   pip install -r requirements.txt
   ```
3. **Start Azure Functions backend:**
   ```zsh
   func start
   ```
4. **Start Flask app:**
   ```zsh
   python3 src/functions/flask_app.py
   ```
5. **Access the web UI:**
   - Go to [http://127.0.0.1:5000](http://127.0.0.1:5000) in your browser.
   - Login with your email (must be on the allow-list). Enter the code sent to your email.
   - Once logged in, you can fetch device info or create new devices.
   - Use the logout button to end your session.

## .env File Example
```
BASE_URL=https://clearpass.ngdata.no
CLIENT_ID=app
CLIENT_SECRET=your_clearpass_secret
SMTP_SERVER=ngmailscan.joh.no
SMTP_PORT=25
SMTP_FROM="NorgesGruppen ClearPass kode <cp-noreply@ngdata.no>"
AZURE_FUNCTION_BASE_URL=http://localhost:7071/api
FLASK_SECRET_KEY=your_random_secret_key
```

You can now use SMTP_FROM with a display name for better email deliverability. Example:

```
SMTP_FROM="NorgesGruppen ClearPass kode <cp-noreply@ngdata.no>"
```

The authentication email now includes:
- A clear sender with display name
- Greeting, code info, validity, and contact details

This improves quality and reduces the risk of the email being flagged as spam.

## Best Practices
- **Never commit your `.env` file or secrets to version control.**
- **Use a strong, random value for `FLASK_SECRET_KEY` in production.**
- **Rotate credentials regularly and audit logs for suspicious activity.**
- **Update `approved_domains.json` as needed to control who can log in and which roles are available.**

---

© 2025 CP-Tekniker. For internal use only.
