// auth.js
// Modul for autentisering og tilbakemeldinger i CP-Tekniker Device Management App.
// Håndterer visning av toast-meldinger, utsending av kode, verifisering av kode og utlogging.

/**
 * Viser en toast-melding øverst til høyre.
 * @param {string} message - Meldingen som skal vises.
 * @param {string} [type="success"] - Type melding ("success" eller "error").
 */
export function showToast(message, type = "success") {
    const toastContainer = document.getElementById("toastContainer");
    const toast = document.createElement("div");
    toast.className = `${type === "error" ? 'bg-red-600' : 'bg-green-600'} text-white px-4 py-2 rounded shadow`;
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

/**
 * Sender forespørsel om autentiseringskode til e-post.
 * @param {Function} disableButtons - Funksjon for å deaktivere knapper under prosessering.
 */
export async function requestAuthCode(disableButtons) {
    const email = document.getElementById("loginEmail").value;
    showToast("Sender kode...");
    disableButtons(["requestAuthBtn"]);
    try {
        const response = await fetch("/request_auth_code", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
        const data = await response.json(); document.getElementById("authCode").value = "";
        if (response.ok) showToast(data.message || "Kode sendt."); else showToast(data.error || "Feil", "error");
    } catch (e) { showToast("Nettverksfeil", "error"); }
    disableButtons(["requestAuthBtn"], false);
}

/**
 * Verifiserer innloggingskode og logger inn bruker hvis korrekt.
 * @param {Function} setLoggedIn - Callback for å sette innloggingsstatus.
 * @param {Function} disableButtons - Funksjon for å deaktivere knapper under prosessering.
 */
export async function verifyAuthCode(setLoggedIn, disableButtons) {
    const email = document.getElementById("loginEmail").value;
    const codeInputEl = document.getElementById("authCode");
    const code = codeInputEl.value.replace(/[^0-9]/g, "").replace(/(.{3})/, "$1-");
    showToast("Verifiserer..."); disableButtons(["loginBtn", "requestAuthBtn"]);
    try {
        const response = await fetch("/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, code }) });
        const data = await response.json(); codeInputEl.value = "";
        if (response.ok) { showToast("Innlogging vellykket."); window.loggedInEmail = email; setLoggedIn(true); } else showToast(data.error || "Feil", "error");
    } catch { showToast("Nettverksfeil", "error"); }
    disableButtons(["loginBtn", "requestAuthBtn"], false);
}

/**
 * Logger ut bruker og viser tilbakemelding.
 * @param {Function} setLoggedIn - Callback for å sette innloggingsstatus til false.
 * @param {Function} showToast - Funksjon for å vise tilbakemelding.
 */
export async function logout(setLoggedIn, showToast) {
    await fetch("/logout", { method: "POST" });
    setLoggedIn(false);
    showToast("Du er logget ut.");
}
