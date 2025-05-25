"""
Rolle- og domenehåndtering for CP-Tekniker Device Management App.
Gir funksjoner for å laste godkjente domener/e-poster og finne roller for en bruker.
"""
import os
import json

def load_approved_domains_and_emails():
    """Laster approved_domains.json og returnerer to lister: godkjente domener og godkjente e-poster."""
    approved_path = os.path.join(
        os.path.dirname(os.path.abspath(__file__)), "..", "approved_domains.json"
    )
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
        print(f"Kunne ikke laste godkjente domener: {e}")
        return [], []

def get_user_roles(email, full_domain_data=None):
    """Returnerer roller for en gitt e-post basert på eksakt match eller domenematch.
    full_domain_data kan sendes inn for å unngå fil-I/O hvis allerede lastet.
    """
    email = email.lower()
    if full_domain_data is None:
        approved_path = os.path.join(
            os.path.dirname(os.path.abspath(__file__)), "..", "approved_domains.json"
        )
        try:
            with open(approved_path, "r") as f:
                full_domain_data = json.load(f)
        except Exception as e:
            print(f"Kunne ikke laste godkjente domener for roller: {e}")
            return []
    for entry in full_domain_data:
        if email == entry["email"]:
            return entry.get("roles", [])
    for entry in full_domain_data:
        if email.endswith("@" + entry["email"]):
            return entry.get("roles", [])
    return []
