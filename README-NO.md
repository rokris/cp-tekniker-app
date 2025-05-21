# CP-Tekniker Enhetsadministrasjonsapp

Dette prosjektet er en nettbasert enhetsadministrasjonsapplikasjon bygget med Flask (Python) og Azure Functions. Den lar brukere hente informasjon om enheter og opprette nye enhetsoppføringer via et enkelt webgrensesnitt. Backend bruker Azure Functions for skalerbare, serverløse API-endepunkter.

## Funksjoner
- **Hent enhetsinfo:** Søk etter enhetsdetaljer via MAC-adresse.
- **Opprett enhet:** Send inn nye enhetsdata via JSON.
- **Moderne UI:** Rent og responsivt webgrensesnitt.
- **Azure-integrasjon:** Bruker Azure Functions for backend-logikk.

## Hvordan det fungerer
- Flask-appen (`src/functions/flask_app.py`) serverer webgrensesnittet og videresender forespørsler til Azure Functions.
- Webgrensesnittet (`src/functions/templates/index.html`) lar brukere skrive inn MAC-adresse eller JSON-data for enhet.
- Når en bruker sender en forespørsel, videresender Flask-appen den til riktig Azure Function-endepunkt (f.eks. `/GetDeviceInfo`, `/CreateDevice`).
- Azure Functions behandler forespørselen og returnerer resultatet, som vises i webgrensesnittet.

## Prosjektstruktur
```
function_app.py           # Azure Functions entry point
host.json                 # Azure Functions host-konfigurasjon
local.settings.json       # Lokale innstillinger for Azure Functions
requirements.txt          # Python-avhengigheter
src/functions/flask_app.py# Flask webserver
src/functions/templates/  # HTML-maler for Flask
```

## Forutsetninger
- Python 3.8+
- [Azure Functions Core Tools](https://docs.microsoft.com/azure/azure-functions/functions-run-local) (for lokal utvikling)
- [Node.js & npm](https://nodejs.org/) (hvis du bruker JavaScript/TypeScript Azure Functions)
- macOS (men fungerer på tvers av plattformer)

## Oppsett & Bruk
1. **Klon repoet:**
   ```zsh
   git clone <din-repo-url>
   cd cp-tekniker-app
   ```
2. **Installer Python-avhengigheter:**
   ```zsh
   pip install -r requirements.txt
   ```
3. **Start Azure Functions backend:**
   ```zsh
   func start
   ```
   Dette kjører Azure Functions lokalt på `http://localhost:7071`.
4. **Start Flask-appen:**
   ```zsh
   python3 src/functions/flask_app.py
   ```
   Webgrensesnittet er tilgjengelig på `http://127.0.0.1:5000`.

## Brukseksempel
- **Hent enhetsinfo:**
  1. Skriv inn en MAC-adresse i feltet.
  2. Klikk "Hent info" for å hente enhetsdetaljer fra Azure Functions.
- **Opprett enhet:**
  1. Skriv inn gyldig JSON i tekstfeltet. Eksempel:
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
  2. Klikk "Opprett enhet" for å sende data til Azure Functions.

## Konfigurasjon
- Alle hemmeligheter, nøkler og URL-er lagres i `.env`-filen og lastes inn med `python-dotenv`. Ingen hemmeligheter eller URL-er er hardkodet i kildekoden.
- Oppdater `approved_domains.json` for å styre hvilke e-postdomener eller adresser som kan logge inn og hvilke roller de får.

## Sikkerhet & Beste praksis
- **Ingen hardkodede hemmeligheter:** Alle sensitive verdier (API-URL-er, klientnøkler, SMTP-innstillinger, Flask secret key) lastes fra miljøvariabler i `.env`.
- **Sesjonssikkerhet:** Flask sin `FLASK_SECRET_KEY` brukes til å signere sesjonskapsler. Bruk en sterk, tilfeldig verdi i produksjon.
- **Tilgangskontroll:** Alle endepunkter for enhetsadministrasjon krever innlogging. Sesjoner er server-side og utløper etter 8 timer eller ved utlogging.
- **E-postdomene-whitelist:** Kun brukere med e-post fra domener eller adresser i `approved_domains.json` kan logge inn.
- **Logging:** Alle autentiserings- og API-feil logges for revisjon og feilsøking.

## Sesjonshåndtering
- Brukerautentisering kreves for alle enhetshandlinger. Innlogging skjer via e-post og en engangskode sendt til e-posten din.
- Sesjoner håndteres server-side med Flask-Session og filsystemlagring. Sesjoner varer i 8 timer eller til brukeren logger ut.
- Logg ut-knappen i webgrensesnittet avslutter sesjonen umiddelbart.
- Både Flask-appen og Azure Functions-backend må kjøre for at applikasjonen skal fungere.

## .env-fil Eksempel
```
BASE_URL=https://clearpass.ngdata.no
CLIENT_ID=app
CLIENT_SECRET=ditt_clearpass_secret
SMTP_SERVER=ngmailscan.joh.no
SMTP_PORT=25
SMTP_FROM="NorgesGruppen ClearPass kode <cp-noreply@ngdata.no>"
AZURE_FUNCTION_BASE_URL=http://localhost:7071/api
FLASK_SECRET_KEY=din_tilfeldige_secret_key
```

Nå kan du bruke SMTP_FROM med visningsnavn for bedre e-postlevering. Eksempel:

```
SMTP_FROM="NorgesGruppen ClearPass kode <cp-noreply@ngdata.no>"
```

E-posten du mottar vil nå inneholde:
- En tydelig avsender med visningsnavn
- Hilsen, informasjon om kode, gyldighet og kontaktinfo

Dette gir bedre kvalitet og mindre risiko for at e-posten havner i spam.

## Beste praksis
- **Aldri legg `.env`-filen eller hemmeligheter i versjonskontroll.**
- **Bruk en sterk, tilfeldig verdi for `FLASK_SECRET_KEY` i produksjon.**
- **Roter nøkler jevnlig og sjekk logger for mistenkelig aktivitet.**
- **Oppdater `approved_domains.json` etter behov for å styre hvem som kan logge inn og hvilke roller som er tilgjengelige.**
   - Legg til dine tillatte e-postdomener og roller i `approved_domains.json` med følgende format:

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

---

© 2025 CP-Tekniker. Kun for intern bruk.
