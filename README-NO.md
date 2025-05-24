# CP-Tekniker Enhetsadministrasjonsapp

En moderne, sikker og brukervennlig enhetsadministrasjonsløsning for NorgesGruppen, bygget med Flask og designet for Docker. Appen er nå modulært organisert for enkel videreutvikling og samarbeid.

---

## Hovedfunksjoner

- **E-postbasert autentisering** med engangskode
- **Rollebasert tilgang**: Handlinger filtreres etter brukerens roller (eksakt e-post > domenematch)
- **Hent og opprett enhet**: Søk på MAC-adresse, opprett nye enheter
- **Rate limiting**: Beskytter mot misbruk
- **Moderne UI**: Tailwind CSS, Lucide-ikoner
- **Kjører i Docker**: Enkel og reproduserbar utrulling

---

## Ny mappe- og modulstruktur

```
app.py                  # Flask-appens entrypoint, blueprint-registrering, error handler
config.py               # All konfigurasjon og .env-håndtering
approved_domains.json   # Godkjente e-poster/domener og roller
requirements.txt        # Python-avhengigheter
Dockerfile              # Docker-byggeinstruksjoner
supervisord.conf        # Kjører Redis og Flask-app i samme container

auth/                   # Autentisering og rate limiting
    limiter.py          # Flask-Limiter setup (Redis)
    routes.py           # Auth-endepunkter (Blueprint)
    utils.py            # Auth-hjelpefunksjoner

clearpass/              # ClearPass API og rollelogikk
    api.py              # API-kall og device-endepunkter (Blueprint)
    roles.py            # Rolle- og domenehåndtering
    routes.py           # Rolle-endepunkt (Blueprint)

utils/
    redis.py            # Redis-klient

templates/
    index.html          # Frontend

static/
    favicon.ico/png     # Ikoner
```

---

## Hvordan virker det?

1. **Innlogging**: Brukeren skriver inn e-post. Hvis e-post/domene er godkjent, sendes en engangskode. Koden tastes inn for å logge inn.
2. **Rollehenting**: Etter innlogging hentes kun de rollene brukeren har tilgang til (eksakt e-post har høyest prioritet).
3. **Enhetsadministrasjon**: Brukeren kan hente info om enheter eller opprette nye, avhengig av sine roller.
4. **Rate limiting**: Alle sensitive endepunkter er beskyttet mot misbruk.

---

## Slik kommer du i gang (Docker)

1. **Klon repoet:**
   ```sh
   git clone <repo-url>
   cd cp-tekniker-app
   ```
2. **Konfigurer miljø:**
   - Rediger `.env` med ClearPass API- og SMTP-innstillinger.
   - Rediger `approved_domains.json` for å angi tillatte e-poster/domener og roller.
3. **Bygg og start med Docker:**
   ```sh
   docker build -t cp-tekniker-app .
   docker run -p 8000:8000 --env-file .env -v $(pwd)/approved_domains.json:/app/approved_domains.json cp-tekniker-app
   ```
   Appen er tilgjengelig på [http://localhost:8000](http://localhost:8000)

---

## Konfigurasjonsfiler

- **.env**: Miljøvariabler for API, SMTP og Flask.
- **approved_domains.json**: Liste over godkjente e-poster/domener og tilhørende roller.

---

## For utviklere

- All backend-logikk er delt opp i moduler og blueprints for enkel videreutvikling.
- Nye funksjoner bør legges til i riktig modul (auth, clearpass, utils).
- Frontend (index.html) kommuniserer kun med backend via definerte endepunkter.

---

## Sikkerhet og beste praksis

- Ingen passord lagres, kun engangskode
- Sesjoner er server-side og utløper etter 8 timer
- Roller håndheves strengt
- Rate limiting på alle sensitive endepunkter
- All konfigurasjon i `.env` (aldri i git)

---

## Feilsøking

- **Får ikke e-post?** Sjekk SMTP-innstillinger og at e-post/domene er i `approved_domains.json`.
- **Rolle mangler?** Sjekk at e-post/domene har riktige roller i `approved_domains.json`.
- **Fil ikke funnet?** Appen forventer at `approved_domains.json` finnes i containeren på `/app/approved_domains.json`.

---

## Lisens

Proprietær. Kun for bruk av NorgesGruppen og autorisert personell.
