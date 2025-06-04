# 🚀 GitHub Contribution Guide (via Fork)

Denne veiledningen beskriver hvordan du som contributor kan bidra til dette prosjektet ved å bruke en fork-basert Git workflow.

---

## ✅ Riktig rekkefølge med kommandoer og forklaringer

### 1. 🔀 Fork repoet på GitHub
Gå til [originalrepoet] og klikk **“Fork”** oppe til høyre.

---

### 2. 💻 Clone din fork lokalt
```bash
git clone https://github.com/<ditt-brukernavn>/<fork-repo>.git
cd <fork-repo>
```

---

### 3. 🔗 Legg til originalrepo som “upstream” (valgfritt, men anbefalt)
```bash
git remote add upstream https://github.com/<eierbruker>/<original-repo>.git
git fetch upstream
```

> Dette gjør det mulig å holde din fork synkronisert med hovedrepoet senere.

---

### 4. 🌿 Opprett en ny feature-branch fra `upstream/dev-rokris`
```bash
git checkout -b feature-mitt-bidrag upstream/dev-rokris
```

> Ikke gjør endringer direkte i `dev-rokris`. Bruk alltid en ny branch.

---

### 5. 🧑‍💻 Utvikle og gjør endringer
Rediger, legg til eller fjern kode etter behov.

---

### 6. ✅ Commit og push endringene
```bash
git add .
git commit -m "Forklarende commit-melding"
git push origin feature-mitt-bidrag
```

---

### 7. 📬 Opprett Pull Request (PR)
- Gå til din fork på GitHub
- Klikk **“Compare & pull request”**
- Velg:
  - From: `feature-mitt-bidrag` *(din fork)*
  - To: `dev-rokris` *(originalrepo)*
- Skriv en forklaring og opprett PR

---

### 8. ✅ PR blir gjennomgått og eventuelt merget
Repo-eier vurderer, gir tilbakemelding og merger når alt er klart.

---

### 9. 🔄 Hent siste oppdatering etter merge
```bash
git checkout dev-rokris
git pull upstream dev-rokris
git push origin dev-rokris
```

> Holder din lokale og eksterne `dev-rokris` oppdatert.

---

### 10. 🧹 Slett den lokale og eksterne feature-branchen
```bash
git branch -d feature-mitt-bidrag
git push origin --delete feature-mitt-bidrag
```

---

## 📌 Tips

- Bruk meningsfulle commit-meldinger og branch-navn.
- Hver Pull Request bør fokusere på **én funksjon eller endring**.
- Hold forken din oppdatert med `upstream` regelmessig.
- Bruk `git status` og `git log` ofte for oversikt.

---

Takk for at du bidrar! 🙌
