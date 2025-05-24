# CP-Tekniker Enhetsadministrasjonsapp (Docker/Flask)

En moderne, sikker og brukervennlig enhetsadministrasjonsløsning for NorgesGruppen, bygget med Flask og designet for å kjøre utelukkende i Docker. Applikasjonen lar godkjente brukere hente enhetsinformasjon og opprette nye enheter via et enkelt webgrensesnitt, med robust rollebasert tilgangskontroll og e-postautentisering.

---

## Funksjoner
- **E-postbasert autentisering**: Sikker innlogging med engangskode sendt til godkjente e-poster.
- **Rollebasert tilgang**: Handlinger filtreres etter brukerens roller, med eksakt e-postmatch prioritert over domenematch.
- **Hent og opprett enhet**: Hent enhetsdetaljer via MAC-adresse og opprett nye enheter.
- **Moderne UI**: Responsivt og tilgjengelig webgrensesnitt (Tailwind CSS, Lucide-ikoner).
- **Robust konfigurasjon**: All konfigurasjon via `.env` og `approved_domains.json`.
- **Kjører i Docker**: Enkel og reproduserbar utrulling med innebygd prosesshåndtering (supervisord).

---

## Hvordan det fungerer
1. **Autentisering**: Brukeren logger inn med e-post. Hvis e-posten eller domenet er godkjent, sendes en engangskode. Når koden tastes inn, opprettes en sesjon.
2. **Rollefiltrering**: Roller bestemmes av eksakt e-postmatch (hvis tilstede i `approved_domains.json`), ellers domenematch. Roller styrer hvilke handlinger brukeren kan utføre.
3. **Enhetsadministrasjon**: Autentiserte brukere kan hente enhetsinfo og opprette nye enheter, avhengig av sine roller.

---

## Kom i gang (Docker)

1. **Klon repoet:**
   ```sh
   git clone <din-repo-url>
   cd cp-tekniker-app
   ```
2. **Konfigurer miljø:**
   - Rediger `.env` med ClearPass API- og SMTP-innstillinger (se under).
   - Rediger `approved_domains.json` for å angi tillatte e-poster/domener og roller.
3. **Bygg og start med Docker:**
   ```sh
   docker build -t cp-tekniker-app .
   docker run -p 8000:8000 --env-file .env -v $(pwd)/approved_domains.json:/app/approved_domains.json cp-tekniker-app
   ```
   Applikasjonen er tilgjengelig på [http://localhost:8000](http://localhost:8000)

---

## Konfigurasjonsfiler

### `.env`
Miljøvariabler for API, SMTP og Flask. Eksempel:
```
BASE_URL=https://clearpass.ngdata.no
CLIENT_ID=app
CLIENT_SECRET=din_clearpass_secret
SMTP_SERVER=ngmailscan.joh.no
SMTP_PORT=25
SMTP_FROM=cp-noreply@ngdata.no
SMTP_FROM_NAME=NorgesGruppen ClearPass kode
FLASK_SECRET_KEY=din_flask_secret
```

### `approved_domains.json`
Definerer hvilke e-poster og domener som er tillatt, og tilhørende roller. Eksempel:
```
[
  { "email": "user1@firma.no", "roles": [ { "role_id": 9901, "role_name": "STORE-VLAN1" } ] },
  { "email": "firma.no", "roles": [ { "role_id": 9902, "role_name": "STORE-VLAN60" } ] }
]
```
- **Eksakt e-postmatch** prioriteres over domenematch.
- Hver oppførings `roles`-array bestemmer hvilke roller brukeren har tilgang til.

### `Dockerfile`
Bygger et minimalt, produksjonsklart Python/Flask-image med alle avhengigheter og supervisord for prosesshåndtering.

### `supervisord.conf`
Kjører både Redis og Flask-appen (via Gunicorn) i samme container.

### `requirements.txt`
Python-avhengigheter for appen (Flask, Flask-Session, requests, redis, Flask-Limiter, osv).

### `templates/index.html`
Moderne, responsivt webgrensesnitt for enhetsadministrasjon.

---

## Fil- og mappestruktur
```
app.py                # Hoved-Flask-app (all backendlogikk)
approved_domains.json # Godkjente e-poster/domener og roller
.env                  # Miljøvariabler (ikke i git)
Dockerfile            # Docker-byggeinstruksjoner
requirements.txt      # Python-avhengigheter
templates/index.html  # Web UI-mal
supervisord.conf      # Prosesshåndtering (kjører Redis + Flask)
```

---

## Sikkerhet og beste praksis
- **Ingen passord lagres**: Autentisering skjer kun med engangskode.
- **Sikker sesjon**: Sesjoner er server-side, varer i 8 timer og slettes ved utlogging.
- **Rollefiltrering**: Kun brukere/e-poster i `approved_domains.json` kan logge inn; roller håndheves strengt.
- **Miljøkonfigurasjon**: Alle hemmeligheter og sensitiv info ligger i `.env` (aldri legg denne i git).
- **Absolutte stier**: Appen laster alltid `approved_domains.json` med absolutt sti for å unngå filfeil.
- **Logging**: Feil og autentiseringsforsøk logges.
- **Rate limiting**: Beskytter innlogging og kodeforespørsel mot brute force-angrep med Flask-Limiter.

---

## Bruk
1. **Logg inn**: Skriv inn godkjent e-post. Sjekk innboksen for engangskode og tast inn for å logge inn.
2. **Hent enhetsinfo**: Skriv inn MAC-adresse og trykk "Hent info".
3. **Opprett enhet**: Velg rolle, fyll ut enhetsdetaljer og send inn.
4. **Logg ut**: Trykk "Logg ut" for å avslutte sesjonen.

---

## Feilsøking
- **Får ikke e-post?** Sjekk SMTP-innstillinger i `.env` og at e-post/domene er i `approved_domains.json`.
- **Rolle mangler?** Sjekk at e-post/domene har riktige roller i `approved_domains.json`.
- **Fil ikke funnet?** Appen forventer at `approved_domains.json` finnes i containeren på `/app/approved_domains.json`.

---

## Lisens
Proprietær. Kun for bruk av NorgesGruppen og autorisert personell.

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
