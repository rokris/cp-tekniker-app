"""
CP-Tekniker Device Management App

Hoved-entrépunkt for Flask-applikasjonen. Initialiserer appen, laster konfigurasjon,
registrerer blueprints for autentisering og ClearPass-funksjonalitet, og sentraliserer feil- og rate limit-håndtering.
"""

from flask import Flask, render_template, session, request, jsonify
from flask_session import Session
from config import Config
from flask_limiter.errors import RateLimitExceeded

# Initialize Flask app
app = Flask(__name__)
app.config.from_object(Config)
app.secret_key = Config.SECRET_KEY
Session(app)

# Registrerer alle blueprints for modulær struktur
from auth.routes import bp as auth_bp  # Autentisering (login, logout, kode)
from clearpass.api import bp as clearpass_api_bp  # ClearPass API-endepunkter (device info, opprettelse)
from clearpass.routes import bp as clearpass_routes_bp  # Rolle-endepunkt

app.register_blueprint(auth_bp)
app.register_blueprint(clearpass_api_bp)
app.register_blueprint(clearpass_routes_bp)

@app.route("/")
def home():
    """Rendrer hovedsiden (index.html). Viser login eller beskyttet innhold avhengig av sesjon."""
    return render_template("index.html", logged_in=session.get("logged_in", False))

@app.route("/is_logged_in", methods=["GET"])
def is_logged_in():
    """Returnerer om brukeren er logget inn (brukes av frontend for å vise riktig innhold)."""
    # Forutsetter at e-post lagres i session["email"] ved login
    return jsonify({
        "logged_in": bool(session.get("logged_in")),
        "email": session.get("email", "")
    })

@app.errorhandler(RateLimitExceeded)
def handle_rate_limit(e):
    """Sentralisert håndtering av rate limiting. Returnerer brukervennlig feilmelding og retry-after."""
    retry_after = None
    if hasattr(e, 'retry_after') and e.retry_after:
        retry_after = int(e.retry_after)
    else:
        retry_after_header = request.headers.get('Retry-After')
        if retry_after_header:
            try:
                retry_after = int(retry_after_header)
            except Exception:
                retry_after = None
        if retry_after is None:
            import re as _re
            match = _re.search(r'(\d+)$', str(e.description))
            if match:
                retry_after = int(match.group(1))
    if retry_after is None:
        retry_after = 60
    message = f"Du har nådd grensen for antall forespørsler. Du kan prøve igjen om {retry_after} sekunder."
    return jsonify({
        "error": message,
        "retry_after": retry_after
    }), 429
