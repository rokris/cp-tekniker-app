# CP-Tekniker Device Management App (Docker/Flask)

A modern, secure, and user-friendly device management web application for NorgesGruppen, built with Flask and designed to run exclusively in Docker. This app allows authenticated users to fetch device information and create new device entries via a clean web interface, with robust role-based access control and email authentication.

---

## Features
- **Email-based authentication**: Secure login using one-time codes sent to approved emails.
- **Role-based access**: Device management actions filtered by user roles, with exact email match prioritized over domain match.
- **Device info & creation**: Fetch device details by MAC address and create new device entries.
- **Modern UI**: Responsive, accessible web interface (Tailwind CSS, Lucide icons).
- **Robust configuration**: All settings via `.env` and `approved_domains.json`.
- **Runs in Docker**: Simple, reproducible deployment with built-in process management (supervisord).

---

## How It Works
1. **Authentication**: Users log in with their email. If the email or its domain is approved, a one-time code is sent via email. Upon entering the code, a session is established.
2. **Role Filtering**: User roles are determined by exact email match (if present in `approved_domains.json`), otherwise by domain match. Roles control which device actions are available.
3. **Device Management**: Authenticated users can fetch device info by MAC address and create new device entries, subject to their allowed roles.

---

## Quick Start (Docker)

1. **Clone the repository:**
   ```sh
   git clone <your-repo-url>
   cd cp-tekniker-app
   ```
2. **Configure environment:**
   - Edit `.env` with your ClearPass API and SMTP settings (see below).
   - Edit `approved_domains.json` to specify allowed emails/domains and their roles.
3. **Build and run with Docker:**
   ```sh
   docker build -t cp-tekniker-app .
   docker run -p 8000:8000 --env-file .env -v $(pwd)/approved_domains.json:/app/approved_domains.json cp-tekniker-app
   ```
   The app will be available at [http://localhost:8000](http://localhost:8000)

---

## Configuration Files

### `.env`
Environment variables for API, SMTP, and Flask settings. Example:
```
BASE_URL=https://clearpass.ngdata.no
CLIENT_ID=app
CLIENT_SECRET=your_clearpass_secret
SMTP_SERVER=ngmailscan.joh.no
SMTP_PORT=25
SMTP_FROM=cp-noreply@ngdata.no
SMTP_FROM_NAME=NorgesGruppen ClearPass kode
FLASK_SECRET_KEY=your_flask_secret
```

### `approved_domains.json`
Defines which emails and domains are allowed, and their associated roles. Example:
```
[
  { "email": "user1@company.com", "roles": [ { "role_id": 9901, "role_name": "STORE-VLAN1" } ] },
  { "email": "company.com", "roles": [ { "role_id": 9902, "role_name": "STORE-VLAN60" } ] }
]
```
- **Exact email match** takes priority over domain match.
- Each entry's `roles` array determines which device roles the user can access.

### `Dockerfile`
Builds a minimal, production-ready Python/Flask image with all dependencies and supervisord for process management.

### `supervisord.conf`
Runs both Redis and the Flask app (via Gunicorn) in the same container.

### `requirements.txt`
Python dependencies for the app (Flask, Flask-Session, requests, redis, etc).

### `templates/index.html`
Modern, responsive web UI for device management.

---

## File/Folder Structure
```
app.py                # Main Flask app (all backend logic)
approved_domains.json # Approved emails/domains and roles
.env                  # Environment variables (not committed)
Dockerfile            # Docker build instructions
requirements.txt      # Python dependencies
templates/index.html  # Web UI template
supervisord.conf      # Process management (runs Redis + Flask)
```

---

## Security & Best Practices
- **No passwords stored**: Authentication is via one-time code only.
- **Session security**: Sessions are server-side, expire after 8 hours, and are cleared on logout.
- **Role filtering**: Only users/emails in `approved_domains.json` can log in; roles are strictly enforced.
- **Environment config**: All secrets and sensitive info are in `.env` (never commit this file).
- **Absolute paths**: The app always loads `approved_domains.json` by absolute path to avoid file errors.
- **Logging**: Debug logging for authentication and email sending is enabled.
- **Rate limiting**: Beskytter innlogging og kodeforespørsel mot brute force-angrep med Flask-Limiter.

---

## Usage
1. **Login**: Enter your approved email. Check your inbox for a one-time code and enter it to log in.
2. **Fetch device info**: Enter a MAC address and click "Hent info".
3. **Create device**: Select a role, enter device details, and submit.
4. **Logout**: Click the "Logg ut" button to end your session.

---

## Troubleshooting
- **Email not received?** Check SMTP settings in `.env` and ensure your email/domain is in `approved_domains.json`.
- **Role not available?** Ensure your email or domain has the correct roles assigned in `approved_domains.json`.
- **File not found errors?** The app expects `approved_domains.json` to be present in the container at `/app/approved_domains.json`.

---

## License
Proprietary. For use by NorgesGruppen and authorized personnel only.

## Krav og avhengigheter

- Python 3.8+
- Flask
- Flask-Session
- Flask-Limiter  
- requests
- python-dotenv
- gunicorn
- redis

Installer alle avhengigheter med:
```sh
pip install -r requirements.txt
```
