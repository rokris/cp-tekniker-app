# CP-Tekniker Device Management App (Docker Version)

This project is a Dockerized version of the CP-Tekniker device management app. It provides the same web GUI, authentication, and integrations as the Azure Functions version, but runs everything in a single container using Flask.

## Features
- Get device info by MAC address
- Create new device entries
- Email-based authentication (one-time code)
- Modern, responsive web UI
- Integrates with ClearPass API and SMTP

## How to Run (Docker)

1. **Copy `.env.example` to `.env` and fill in your secrets/config:**
   ```sh
   cp .env.example .env
   # Edit .env with your values
   ```
2. **Build the Docker image:**
   ```sh
   docker build -t cp-tekniker-app .
   ```
3. **Run the container:**
   ```sh
   docker run --env-file .env -p 5000:5000 cp-tekniker-app
   ```
4. **Open the app:**
   - Go to [http://localhost:5000](http://localhost:5000)

## Folder Structure
```
app.py                  # Main Flask app (all logic, API, and integrations)
approved_domains.txt    # List of allowed email domains
requirements.txt        # Python dependencies
Dockerfile              # Docker build file
.env.example            # Example environment config
/templates/index.html   # Web UI template
```

## Security & Best Practices
- No secrets in code; use `.env` for all config
- Session and authentication logic is server-side
- Email domain allow-list in `approved_domains.txt`
- Logging for all errors and authentication events

## Notes
- This version does **not** require Azure Functions or any Azure SDKs.
- All backend logic is handled by Flask in the container.
- SMTP and ClearPass API credentials must be provided in `.env`.

---
© 2025 CP-Tekniker. For internal use only.
