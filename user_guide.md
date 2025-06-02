
# Brukerveiledning for enhetsadministrasjon

Denne veiledningen beskriver steg for steg hvordan du som sluttbruker navigerer i appen for å hente, opprette og redigere enheter. Alt grensesnitt er på norsk og tilrettelagt for enkel bruk uten tekniske detaljer.

---

## 1. Innlogging

1. **Åpne appen**. Du møter et innloggingsvindu.  
2. Tast inn e-postadressen din og trykk **«Send kode»**. Du mottar en engangskode på e-post.  
3. Skriv inn den mottatte koden og trykk **«Verifiser kode»**.  
4. Når koden er godkjent, kommer du til hovedskjermen for enhetsadministrasjon.

> **Viktig:** Hvis innloggingen feiler (feil kode eller nettverksproblem), vises en feilmelding i rødt øverst på skjermen. Prøv på nytt, eller kontakt systemansvarlig ved vedvarende problemer.

---

## 2. Oversikt og navigasjon

### Ikoner og knapper

- ![Plus-knapp](sandbox:/mnt/data/plus_button.png) **+**: Brukes for å opprette ny enhet.
- ![Kamera-knapp](sandbox:/mnt/data/camera_button.png) **Kamera**: Brukes for OCR-skanning for å lese av MAC-adresse.
- ![Blyant-ikon](sandbox:/mnt/data/edit_button.png) **Rediger**: Brukes for å gå til redigeringsmodus i enhetsdialog.
- ![Lagre-knapp](sandbox:/mnt/data/save_button.png) **Lagre**: Brukes for å lagre endringer i redigeringsmodus.
- ![Avbryt-knapp](sandbox:/mnt/data/cancel_button.png) **Avbryt**: Brukes for å avbryte endringer i redigeringsmodus.



Når du er logget inn, ser du følgende elementer:

- **Toppfelt** med app-ikon og navn til venstre, og en utloggingsknapp til høyre.  
- **Meldingsfelt (“toast”)** øverst – brukes til å vise suksess- eller feilmeldinger etter handlinger.  
- **Hovedområde** med:  
  - Et inntastingsfelt for **MAC-adresse**.  
  - Knappen **«Hent enhet»** for å søke opp eksisterende enhet basert på MAC.  
  - En **drop-down meny for rollevalg** som viser de tilgjengelige rollene.  
  - Et tekstfelt for **enhetsnavn**.  
  - En **datovelger for utløpstid** (dato og klokkeslett).  
  - En **avkryssningsboks for “Aktivert”**.  
  - Et tekstfelt som viser hvem som er **«Sponset av»**, automatisk utfylt ved oppretting eller redigering.  
  - To **flytende handlingsknapper** (rundt ikon i hjørnet av skjermen) som dukker opp når du er i redigeringsmodus: én for å lagre endringer og én for å avbryte uten å lagre.  
  - En **«+»-knapp** nede i høyre hjørne som brukes til å opprette nye enheter.  
- **Kameraknapp** øverst i innholdsområdet: åpner et skjermbilde for å skanne en strekkode eller QR-kode for å lese av MAC-adresse.

---

## 3. Hente eksisterende enhet

1. **Skriv inn MAC-adressen** i feltet øverst.  
2. Klikk **«Hent enhet»**.  
   - Appen kontakter serveren og henter all informasjon om enheten som har den angitte MAC-adressen.  
   - Hvis henting er vellykket, dukker en informasjonsdialog opp med enhetens detaljer. Samtidig lagres dataene i bakgrunnen slik at du kan redigere eller avbryte senere.

3. **Informasjonsdialogen** har to visninger:  
   - **Visningsmodus** (lesemodus): Alle felt er låst, og du kan kun lukke dialogen.  
   - **Redigeringsmodus**: For å endre informasjon klikker du på **blyant-ikonet** i dialogens toppfelt. Da blir alle redigerbare felt aktive, og to handlingsknapper for “Lagre” og “Avbryt” vises.

4. **Redigeringsmodus**:  
   - Du kan endre rolle, enhetsnavn, utløpstid eller aktiv-status.  
   - Trykk **«Lagre»** for å sende endringene til serveren.  
     - Ved suksess: Dialogen går tilbake til visningsmodus med oppdaterte verdier, og du ser en grønn melding om at endringene er lagret.  
     - Ved feil: Du forblir i redigeringsmodus og får en rød melding som forklarer hva som gikk galt.  
   - Trykk **«Avbryt»** for å gå tilbake til visningsmodus uten å lagre. Alle felt får tilbake de opprinnelige verdiene som var lagret tidligere.

5. For å **lukke dialogen**, klikker du på krysset i øvre høyre hjørne. Du returnerer da til hovedskjermen, hvor MAC-feltet fortsatt viser den adressen du søkte på.

> **Tips:** Bruk alltid **«Avbryt»** hvis du vil forkaste endringer før du lagrer. Å lukke dialogen uten å trykke «Avbryt» kan i enkelte tilfeller føre til at redigerte, uskrevne data blir værende i skjemaet.

---

## 4. Opprette ny enhet

1. Klikk **«+»-knappen** nede i høyre hjørne. Da vises et skjema for å opprette en ny enhet.  
2. Alle feltene er blanke og redigerbare:  
   - Skriv inn **MAC-adresse**.  
   - Velg ønsket **rolle** fra nedtrekkslisten.  
   - Skriv inn **enhetsnavn**.  
   - Velg dato og klokkeslett for når enheten skal utløpe (valgfritt).  
   - Huk av om enheten skal være **aktiv** med én gang (valgfritt).  
   - Feltet **«Sponset av»** fylles automatisk med din e-postadresse.

3. Når du har fylt inn, klikker du **«Opprett enhet»**.  
   - Hvis du har glemt obligatoriske felter (MAC og enhetsnavn), vises en rød feilmelding.  
   - Ved gyldig input: du ser en grønn melding om at enheten er opprettet, og dialogen lukker seg. Appen lagrer den nye enheten i bakgrunnen.

4. Etter opprettelse vil MAC-adressen vises i hovedskjermen. Da kan du om ønskelig hente enheten på nytt for å se den nøyaktige informasjonen, eller redigere direkte.

> **Merk:** Hvis det finnes en enhet med samme MAC fra før, vil serveren avvise opprettelsen, og du får en feilmelding i rødt. Prøv med en annen MAC-adresse.

---

## 5. Bruke kamera / OCR for å lese av MAC

1. Klikk på **“Kameraknappen”** i toppfeltet på hovedskjermen eller i opprett-/redigeringsdialogen.  
2. Appen ber om lov til å bruke kameraet. Gi tillatelse når nettleseren spør.  
3. Når kameravinduet åpner seg, ser du en videostrøm fra kameraet. Posisjoner enhetens strekkode, QR-kode eller et synlig skilt som viser MAC-adressen.  
4. Juster eventuelt en markørboks rundt området der teksten vises og trykk **«Skann tekst»** for å la OCR-funksjonen gjenkjenne tegnene.  
5. Hvis gjenkjenningen lykkes, dukker en liste over mulige tekstresultater opp under videostrømmen. Velg riktig element, og MAC-adressen fylles automatisk inn i skjemaet.  
6. Lukk kameravinduet ved å klikke på **«Lukk»-knappen** eller krysset øverst, og fortsett med videre handling (hent, opprett eller oppdater).

> **Tips:** OCR fungerer best under godt lys og tydelig kontrast. Hvis resultatene blir feil, prøv å stabilisere kameraet eller forbedre belysningen.

---

## 6. Feltforklaringer og vanlige bruksregler

- **MAC-adresse**
  Flere formater støttes, for eksempel:
  - Kolon-separert (f.eks. `Ab:CD:eF:12:34:56`)
  - Bindestreks-separert (f.eks. `AB-cD-Ef-12-34-56`)
  - Singel-bindestreks-separert (f.eks. `ABcDEf-123456`)
  - Punktum separert (f.eks. `AbCD.Ef12.3456`)
  - Uten skilletegn (f.eks. `ABcDEf123456`)
  - Ved oppretting: skriv eller skann MAC.
  - Ved henting/redigering: tast inn eksisterende MAC og hent data.
- **Rolle**  
  - Velg den rollen som skal knyttes til enheten (f.eks. «Tekniker», «Gjest», «Admin»). Hvis den du ønsker ikke vises, kan det bety at den ikke finnes i systemet. Oppdater siden for å hente de nyeste rollene fra serveren hvis nødvendig.

- **Enhetsnavn**  
  - Fritekstfelt for å gi enheten et gjenkjennbart navn. Obligatorisk ved oppretting og ved endring.

- **Utløper**  
  - Sett dato og klokkeslett for når enheten skal slutte å fungere. Fungerer som en automatisk sperre. Valgfritt – lar du feltet stå tomt, vil enheten ikke ha noe utløp.

- **Aktivert**  
  - Når dette er huket av, fungerer enheten med en gang. Ved oppretting er dette vanligvis ikke huket av med mindre du ønsker å aktivere umiddelbart.  
  - Ved henting vises det som den siste kjente statusen fra server.

- **Sponset av**  
  - Viser hvilken bruker (din e-postadresse) som opprettet eller sist endret enheten. Feltet fylles automatisk og kan ikke endres manuelt.

- **Lagre / Avbryt**  
  - Når du er i redigeringsmodus, bruk **«Lagre»** for å bekrefte endringene. Bruk **«Avbryt»** dersom du vil angre alle endringer og gå tilbake til forrige lagrede informasjon.

---

## 7. Logg ut

- Klikk **utloggingsknappen** øverst i høyre hjørne.  
- Du sendes tilbake til innloggingsvinduet. For å få tilgang igjen, må du logge inn på nytt med e-post og engangskode.

> **Viktig:** Alle lokale data (midlertidig lagring av enhetsinfo til redigering) blir slettet ved utlogging. Du får ikke tilgang til dem igjen uten å hente enheten på nytt.

---

## 8. Eksempler på vanlige brukerflyter

### Eksempel A: Hente og redigere en eksisterende enhet

1. Logg inn med e-post og engangskode.  
2. Skriv inn MAC-adressen i inntastingsfeltet.  
3. Klikk **«Hent enhet»**. En dialog med enhetens informasjon vises.  
4. For å gjøre endringer, klikk på **blyantikonet**. Feltene blir redigerbare.  
5. Endre for eksempel utløpstid eller aktiv-status.  
6. Klikk **«Lagre»** for å bekrefte. En grønn melding bekrefter at endringene er lagret, og du ser oppdatert innhold i dialogen.  
7. Trykk på krysset for å lukke dialogen. Ny informasjon vises i hovedskjermen.

### Eksempel B: Opprette ny enhet

1. Logg inn.  
2. Klikk **«+»-knappen** nede i høyre hjørne. Et tomt skjema vises.  
3. Fyll inn alle nødvendige felter:  
   - **MAC-adresse** (må følge korrekt format)  
   - **Rolle** (velg fra liste)  
   - **Enhetsnavn**  
   - **Utløpstid** (valgfritt)  
   - **Aktivert** (valgfritt)  
4. Klikk **«Opprett enhet»**.  
5. Hvis alt er korrekt, lukkes skjemaet, og du ser en melding om at enheten er opprettet.  
6. MAC-adressen legges automatisk inn i søkefeltet på hovedskjermen. Klikk **«Hent enhet»** for å dobbeltsjekke informasjonen, eller gå rett videre til redigering fra dialogen.

### Eksempel C: Bruke kamera for å skanne MAC

1. Logg inn.  
2. Klikk på **kameraikonet**. Et nytt vindu viser videostrøm.  
3. Posisjoner enhetens strekkode eller et synlig skilt med MAC foran kameraet.  
4. Trykk **«Skann tekst»**. Vent til OCR har funnet tekst.  
5. En liste med gjenkjente tekster vises. Velg korrekt tekst for å fylle inn MAC-adressen automatisk.  
6. Lukk kamera-vinduet. Fortsett å hente, opprette eller redigere enheten som vanlig.

---

## 9. Vanlige feilmeldinger og hva de betyr

- **«Feltet ‘Enhetsnavn’ og ‘MAC-adresse’ må fylles ut.»**  
  Oppstår når du forsøker å opprette eller oppdatere uten å ha fylt begge obligatoriske felt. Skriv inn begge feltene før du prøver igjen.

- **«Enhet opprettet.»**  
  Bekrefter at en ny enhet er lagret i systemet.

- **«Endringer lagret.»**  
  Bekrefter at dine endringer på en eksisterende enhet er lagret.

- **«Feil ved henting av enhet»** eller **«Feil ved opprettelse av enhet»**  
  Meldingen indikerer feil fra serveren, for eksempel hvis ingen enhet finnes med oppgitt MAC, eller hvis du prøver å opprette en duplikat. Sjekk at MAC-adressen er korrekt og prøv på nytt.

- **«Nettverksfeil»**  
  Viser at appen ikke fikk svar fra server. Kontroller nettverkstilkoblingen og prøv igjen om litt.

---

## 10. Tips og anbefalinger

- **Bruk «Avbryt»-knappen** når du vil kaste alle endringer du har gjort i redigeringsmodus. Da trykkes ingen endringer gjennom til serveren.  
- **Hold rollelisten oppdatert** ved å laste siden på nytt hvis du vet at nye roller er lagt til.  
- **Sørg for riktig MAC-format**; dersom formatet er feil, vil ikke systemet finne eller akseptere enheten.  
- **God belysning for OCR**: Hvis du bruker kamera til å skanne MAC, sørg for godt lys og strekkodensikt uten skygger.

---



## 12. Tastatursnarveier

- **Enter**: ![Enter](sandbox:/mnt/data/enter_key.png)
  - På hovedskjermen, etter å ha skrevet inn MAC-adresse, kan du trykke **Enter** for å utføre «Hent enhet» uten å klikke på knappen.
  - I opprett- eller redigeringsdialoger, når du står i et tekstfelt, vil **Enter** vanligvis aktivere standardhandlingen:
    - Hvis fokus er på et input-felt i en redigeringsdialog, tilsvarer **Enter** som regel «Lagre»-knappen, slik at du kan sende inn endringer raskt.
    - I opprettingsdialogen, når alle obligatoriske felter er utfylt, vil **Enter** aktivere «Opprett enhet».
- **Esc**: ![Esc](sandbox:/mnt/data/esc_key.png)
  - I alle modaler (hente, opprette, redigere, og kamera-dialog), kan du trykke **Esc** for å lukke modalen:
    - Hvis du er i redigeringsmodus for enhet og har gjort endringer, fungerer **Esc** på samme måte som «Avbryt»: endringer kastes og du går tilbake til visningsmodus.
    - I kameramodalen vil **Esc** lukke kamera uten å skanne.
    - I en enkel visningsmodal (uten aktiv redigering) vil **Esc** bare lukke modalen.

Disse snarveiene gjør det raskere å navigere i appen uten å bruke musen hele tiden.

## 11. Sammendrag

1. **Logg inn** med e-post og kode.  
2. På hovedskjermen:  
   - Hent eksisterende enhet ved å skrive inn MAC og trykke **«Hent enhet»**.  
   - Rediger ved å klikke blyantikonet, så **«Lagre»** eller **«Avbryt»**.  
   - Opprett ny enhet ved å klikke **«+»**, fylle ut skjemaet og trykke **«Opprett enhet»**.  
   - Skann MAC med **kameraikonet** for rask inntasting.  
3. **Logg ut** ved å klikke utloggingsknappen øverst til høyre.

Med denne veiledningen kan du enkelt hente, opprette og endre enheter i systemet uten å bekymre deg for tekniske detaljer. Lykke til!
