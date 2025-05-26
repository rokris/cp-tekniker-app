<p align="center">
  <img src="static/favicon.png" width="90" alt="Hovedlogo"/>
</p>

# CP-Tekniker

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

## Konfigurasjonsfiler

- **.env**: Miljøvariabler for API, SMTP og Flask.

  **Eksempel på .env:**

  ```env
  BASE_URL=https://clearpass.ngdata.no
  CLIENT_ID=app
  CLIENT_SECRET=your_clearpass_secret
  SMTP_SERVER=ngmailscan.joh.no
  SMTP_PORT=25
  SMTP_FROM=cp-noreply@ngdata.no
  SMTP_FROM_NAME=NorgesGruppen ClearPass kode
  FLASK_SECRET_KEY=your_flask_secret
  REDIS_URL=redis://localhost:6379/0
  ```

- **approved_domains.json**: Liste over godkjente e-poster/domener og tilhørende roller.

  ### Om approved_domains.json

  Filen `approved_domains.json` definerer hvilke e-poster og domener som er godkjent for innlogging, og hvilke roller de har tilgang til. Hver oppføring kan være en eksakt e-postadresse eller et domene, og har en tilhørende liste med roller.

  **Eksempel på innhold:**

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

  - Hvis "email" inneholder en full e-postadresse, gjelder oppføringen kun for denne brukeren.
  - Hvis "email" kun er et domene (f.eks. `firma.no`), gjelder oppføringen for alle brukere med e-post i dette domenet.
  - "roles" er en liste med objekter som definerer hvilke ClearPass-roller brukeren eller domenet har tilgang til.
  - Eksakt e-postmatch har alltid høyere prioritet enn domenematch.

  Dette gir fleksibel og sikker styring av hvem som kan logge inn og hvilke roller de får tilgang til.

- **Dockerfile**: Bygger et minimalt, produksjonsklart Python/Flask-image med alle avhengigheter og supervisord for prosesshåndtering. Sikrer at appen kjører likt i alle miljøer.

- **supervisord.conf**: Konfigurerer supervisord til å starte både Redis og Flask-appen (via Gunicorn) i samme container. Gir robust prosesshåndtering og enkel oppstart.

- **requirements.txt**: Lister alle Python-avhengigheter for prosjektet (f.eks. Flask, Flask-Session, requests, redis, python-dotenv, gunicorn). Brukes av Dockerfile og ved lokal utvikling.

- **templates/index.html**: Frontend for appen. Moderne, responsivt webgrensesnitt med Tailwind CSS og Lucide-ikoner. Kommuniserer med backend via definerte API-endepunkter.

- **config.py**: Sentral konfigurasjonsfil for hele applikasjonen. Leser inn miljøvariabler fra .env og gjør dem tilgjengelig via Config-klassen. Brukes for styring av API-nøkler, SMTP, Redis, osv.

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

## API-dokumentasjon (Swagger/OpenAPI)

Du kan se og teste API-dokumentasjonen interaktivt med Swagger Editor:

- [Åpne Swagger Editor](https://editor.swagger.io/)
- I Swagger Editor: Velg "File" → "Import File" og åpne `openapi.yaml` fra dette prosjektet.
- Eller kopier innholdet fra `openapi.yaml` og lim det inn i editor-vinduet.

Dette gir deg en levende, interaktiv oversikt over alle API-endepunkter og datamodeller.

---

## Om logoen og symbolikken

Vår logo består av fire fargede kvadranter som sammen illustrerer kjerneområdene til nettverksgruppen:

<table>
  <tr>
    <td align="center"><img src="blue_quadrant.png" width="60" alt="Planlegging og struktur"/></td>
    <td align="center"><img src="red_quadrant.png" width="60" alt="Sikkerhet og kontroll"/></td>
    <td align="center"><img src="yellow_quadrant.png" width="60" alt="Installasjon og fysisk drift"/></td>
    <td align="center"><img src="green_quadrant.png" width="60" alt="Mobilitet og tilgjengelighet"/></td>
  </tr>
  <tr>
    <td align="center"><b>Planlegging og struktur</b></td>
    <td align="center"><b>Sikkerhet og kontroll</b></td>
    <td align="center"><b>Installasjon og fysisk drift</b></td>
    <td align="center"><b>Mobilitet og tilgjengelighet</b></td>
  </tr>
</table>

Disse fire symbolene utgjør et helhetlig bilde av hva nettverksgruppen jobber med:

- <b>Planlegging og struktur</b> <img src="blue_quadrant.png" width="18" style="vertical-align:middle"/>: Strategisk planlegging, design og strukturering av nettverk.
- <b>Sikkerhet og kontroll</b> <img src="red_quadrant.png" width="18" style="vertical-align:middle"/>: Fokus på sikkerhet, tilgangskontroll og overvåking.
- <b>Installasjon og fysisk drift</b> <img src="yellow_quadrant.png" width="18" style="vertical-align:middle"/>: Praktisk installasjon, kabling og fysisk infrastruktur.
- <b>Mobilitet og tilgjengelighet</b> <img src="green_quadrant.png" width="18" style="vertical-align:middle"/>: Trådløse løsninger, fleksibilitet og brukertilgjengelighet.

Logoen symboliserer at vi dekker hele spekteret fra planlegging til daglig drift og tilgjengelighet.

---

## Lisens

Proprietær. Kun for bruk av NorgesGruppen og autorisert personell.
