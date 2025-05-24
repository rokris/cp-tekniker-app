from flask import Flask, render_template, session, request, jsonify
from flask_session import Session
from config import Config
from flask_limiter.errors import RateLimitExceeded

# Initialize Flask app
app = Flask(__name__)
app.config.from_object(Config)
app.secret_key = Config.SECRET_KEY
Session(app)

# Register blueprints
from auth.routes import bp as auth_bp
from clearpass.api import bp as clearpass_api_bp
from clearpass.routes import bp as clearpass_routes_bp

app.register_blueprint(auth_bp)
app.register_blueprint(clearpass_api_bp)
app.register_blueprint(clearpass_routes_bp)

@app.route("/")
def home():
    return render_template("index.html", logged_in=session.get("logged_in", False))

@app.route("/is_logged_in", methods=["GET"])
def is_logged_in():
    return jsonify({"logged_in": bool(session.get("logged_in"))})

@app.errorhandler(RateLimitExceeded)
def handle_rate_limit(e):
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
