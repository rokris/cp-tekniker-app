<p align="center">
  <img src="static/favicon.png" width="90" alt="Logo"/>
</p>

# CP-Tekniker

A modern, secure, and user-friendly device management solution for NorgesGruppen, built with Flask and designed for Docker. The app is now modular and ready for collaborative development.

---

## Main Features

- **Email-based authentication** with one-time code
- **Role-based access**: Actions filtered by user roles (exact email > domain match)
- **Fetch and create device**: Search by MAC address, create new devices
- **Rate limiting**: Protects against abuse
- **Modern UI**: Tailwind CSS, Lucide icons
- **Runs in Docker**: Simple, reproducible deployment

---

## New Folder & Module Structure

```
app.py                  # Flask app entrypoint, blueprint registration, error handler
config.py               # All configuration and .env handling
approved_domains.json   # Approved emails/domains and roles
requirements.txt        # Python dependencies
Dockerfile              # Docker build instructions
supervisord.conf        # Runs Redis and Flask app in same container

auth/                   # Authentication and rate limiting
    limiter.py          # Flask-Limiter setup (Redis)
    routes.py           # Auth endpoints (Blueprint)
    utils.py            # Auth helper functions

clearpass/              # ClearPass API and role logic
    api.py              # API calls and device endpoints (Blueprint)
    roles.py            # Role and domain handling
    routes.py           # Role endpoint (Blueprint)

utils/
    redis.py            # Redis client

templates/
    index.html          # Frontend

static/
    favicon.ico/png     # Icons
```

---

## How does it work?

1. **Login**: User enters email. If email/domain is approved, a one-time code is sent. Entering the code logs in the user.
2. **Role fetching**: After login, only the roles the user has access to are fetched (exact email has highest priority).
3. **Device management**: User can fetch device info or create new devices, depending on their roles.
4. **Rate limiting**: All sensitive endpoints are protected against abuse.

---

## Getting Started (Docker)

1. **Clone the repo:**
   ```sh
   git clone <repo-url>
   cd cp-tekniker-app
   ```
2. **Configure environment:**
   - Edit `.env` with your ClearPass API and SMTP settings.
   - Edit `approved_domains.json` to specify allowed emails/domains and roles.
3. **Build and run with Docker:**
   ```sh
   docker build -t cp-tekniker-app .
   docker run -p 8000:8000 --env-file .env -v $(pwd)/approved_domains.json:/app/approved_domains.json cp-tekniker-app
   ```
   The app will be available at [http://localhost:8000](http://localhost:8000)

---

## Configuration Files

- **.env**: Environment variables for API, SMTP, and Flask.
- **approved_domains.json**: List of approved emails/domains and their roles.

### About approved_domains.json

The `approved_domains.json` file defines which emails and domains are approved for login, and which roles they have access to. Each entry can be an exact email address or a domain, and has an associated list of roles.

**Example content:**

```json
[
  {
    "email": "ola.normann@firma.no",
    "roles": []
  },
  {
    "email": "firma.no",
    "roles": [
      { "role_id": 9901, "role_name": "STORE-VLAN1" },
      { "role_id": 9902, "role_name": "STORE-VLAN60" }
    ]
  },
  {
    "email": "ola_normann@hotmail.com",
    "roles": [
      { "role_id": 9903, "role_name": "STORE-VLAN151 Kundenett" },
      { "role_id": 9906, "role_name": "STORE-VLAN140 Clients" }
    ]
  }
]
```

- If "email" contains a full email address, the entry applies only to that user.
- If "email" is just a domain (e.g. `firma.no`), the entry applies to all users with an email in that domain.
- "roles" is a list of objects defining which ClearPass roles the user or domain has access to.
- Exact email match always takes precedence over domain match.

This provides flexible and secure control over who can log in and which roles they are granted.

---

## For Developers

- All backend logic is split into modules and blueprints for easy further development.
- New features should be added to the correct module (auth, clearpass, utils).
- The frontend (index.html) communicates only with the backend via defined endpoints.

---

## Security & Best Practices

- No passwords stored, only one-time code
- Sessions are server-side and expire after 8 hours
- Roles are strictly enforced
- Rate limiting on all sensitive endpoints
- All configuration in `.env` (never in git)

---

## Troubleshooting

- **Not receiving email?** Check SMTP settings and that your email/domain is in `approved_domains.json`.
- **Role missing?** Check that your email/domain has the correct roles in `approved_domains.json`.
- **File not found?** The app expects `approved_domains.json` to be present in the container at `/app/approved_domains.json`.

---

## API Documentation (Swagger/OpenAPI)

You can view and interact with the API documentation using Swagger Editor:

- [Open Swagger Editor](https://editor.swagger.io/)
- In Swagger Editor, click "File" → "Import File" and select `openapi.yaml` from this repository.
- Or, copy the contents of `openapi.yaml` and paste it into the editor window.

This gives you a live, interactive view of all API endpoints and schemas.

---

## License

Proprietary. For use by NorgesGruppen and authorized personnel only.
