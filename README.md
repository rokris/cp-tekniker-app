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

---

© 2025 CP-Tekniker. For internal use only.
