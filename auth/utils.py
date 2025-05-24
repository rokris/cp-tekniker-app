# Authentication utilities: send_auth_code, generate_auth_code, is_email_approved
import random
import re
import smtplib
from email.message import EmailMessage
import email.utils
from config import Config

def generate_auth_code():
    return f"{random.randint(100,999)}-{random.randint(100,999)}"

def send_auth_code(recipient_email, code):
    from_name = Config.SMTP_FROM_NAME
    msg = EmailMessage()
    msg["Subject"] = "Din engangskode for innlogging til Aruba ClearPass"
    msg["From"] = email.utils.formataddr((from_name, Config.SMTP_FROM))
    msg["To"] = recipient_email
    msg["List-Unsubscribe"] = "<mailto:unsubscribe@ngdata.no?subject=unsubscribe-clearpass>"
    msg["X-Mailer"] = "Python SMTP via ClearPass"
    text_part = f"""Hei!

Du har bedt om en engangskode for å logge inn i NorgesGruppens Aruba ClearPass administrasjonsløsning.

Din kode er: {code}

Denne koden er gyldig i 10 minutter og kan kun brukes én gang.

Hvis du ikke har bedt om denne koden, kan du se bort fra denne e-posten.

Med vennlig hilsen
NorgesGruppen Data AS
"""
    html_part = f"""<html>
  <body style=\"font-family: sans-serif; color: #333;\">
    <p>Hei!</p>
    <p>Du har bedt om en engangskode for å logge inn i <strong>NorgesGruppens Aruba ClearPass administrasjonsløsning</strong>.</p>
    <p><strong>Din kode er:</strong></p>
    <p style=\"font-size: 1.5em; font-weight: bold; color: #005EB8;\">{code}</p>
    <p>Koden er gyldig i <strong>10 minutter</strong> og kan kun brukes én gang.</p>
    <p>Hvis du ikke har bedt om denne koden, kan du se bort fra denne e-posten.</p>
    <p>Med vennlig hilsen,<br>NorgesGruppen Data AS</p>
  </body>
</html>
"""
    msg.set_content(text_part, subtype="plain", charset="utf-8")
    msg.add_alternative(html_part, subtype="html", charset="utf-8")
    try:
        with smtplib.SMTP(Config.SMTP_SERVER, Config.SMTP_PORT) as server:
            server.send_message(msg)
        return True
    except Exception as e:
        print(f"Kunne ikke sende e-post: {e}")
        return False

def is_email_approved(email, approved_domains, approved_emails):
    email = email.lower()
    if email in approved_emails:
        return True
    match = re.match(r"^[^@]+@([^@]+)$", email)
    if not match:
        return False
    domain = match.group(1)
    return domain in approved_domains
