// ui.js
// Hjelpemodul for brukergrensesnitt-funksjoner i CP-Tekniker Device Management App.
// Inneholder funksjoner for å vise/skjule knapper, tilbakestille felter, og håndtere visning av redigerings- og standardknapper.

/**
 * Deaktiverer eller aktiverer knapper basert på id-liste.
 * @param {string[]} ids - Liste over element-IDer.
 * @param {boolean} [disabled=true] - Om knappene skal deaktiveres.
 */
export function disableButtons(ids, disabled = true) {
    ids.forEach(id => document.getElementById(id).disabled = disabled);
}

/**
 * Tilbakestiller alle felter i enhetsinfo-skjemaet til standardverdier.
 */
export function resetFieldsToDefault() {
    const dropdown = document.getElementById("roleDropdown");
    dropdown.value = dropdown.options.length > 0 ? dropdown.options[0].value : "";
    document.getElementById("visitorName").value = "";
    document.getElementById("expireTime").value = "";
    document.getElementById("enabledCheckbox").checked = true;
    document.getElementById("sponsorName").value = "";
}

/**
 * Viser eller skjuler innloggingsmodal og hovedinnhold basert på innloggingsstatus.
 * @param {boolean} loggedIn - Om brukeren er innlogget.
 * @param {Function} fetchDeviceRoles - Funksjon for å hente roller hvis innlogget.
 */
export function setLoggedIn(loggedIn, fetchDeviceRoles) {
    document.getElementById("loginModal").classList.toggle("hidden", loggedIn);
    document.getElementById("protectedContent").classList.toggle("hidden", !loggedIn);
    document.getElementById("logoutBtn").classList.toggle("hidden", !loggedIn);
    // Skjul eller vis FAB avhengig av innloggingsstatus
    const fab = document.getElementById("createDeviceBtn");
    if (fab) {
        fab.style.display = loggedIn ? "flex" : "none";
        fab.disabled = !loggedIn;
    }
    if (loggedIn) fetchDeviceRoles();
}

/**
 * Viser redigeringsknapper (Lagre/Avbryt) og kobler tilhørende callbacks.
 * @param {Function} saveEdits - Callback for lagring.
 * @param {Function} cancelEdits - Callback for avbryt.
 */
export function showEditButtons(saveEdits, cancelEdits) {
    const actionDiv = document.getElementById("actionButtons");
    // Fjern "ukjent rolle" fra dropdown før redigering
    const dropdown = document.getElementById("roleDropdown");
    const unknownOpt = dropdown.querySelector('option[data-unknown-role]');
    if (unknownOpt) unknownOpt.remove();
    actionDiv.innerHTML = `
    <button id="saveBtn" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg">Lagre</button>
    <button id="cancelBtn" class="flex-1 bg-gray-100 hover:bg-gray-200 text-black py-2 rounded-lg border border-gray-400">Avbryt</button>
  `;
    document.getElementById("macaddr").disabled = true;
    document.getElementById("saveBtn").addEventListener("click", saveEdits);
    document.getElementById("cancelBtn").addEventListener("click", cancelEdits);
}

/**
 * Viser standard handlingsknapper (Hent info/Opprett enhet) og kobler tilhørende callbacks.
 * @param {Function} getDeviceInfo - Callback for å hente enhetsinfo.
 * @param {Function} createDevice - Callback for å opprette enhet.
 */
// Sørg for at FAB alltid vises når standard action buttons settes
export function setDefaultActionButtons(getDeviceInfo, createDevice) {
    const actionDiv = document.getElementById("actionButtons");
    // Fjern "ukjent rolle" fra dropdown før standard handling
    const dropdown = document.getElementById("roleDropdown");
    const unknownOpt = dropdown.querySelector('option[data-unknown-role]');
    if (unknownOpt) unknownOpt.remove();
    // Ikke legg til noen knapp i actionButtons, FAB brukes nå
    actionDiv.innerHTML = "";
    document.getElementById("macaddr").disabled = false;
    // Hvis FAB ikke finnes, legg den til i DOM
    if (!document.getElementById("createDeviceBtn")) {
        const fab = document.createElement("button");
        fab.id = "createDeviceBtn";
        fab.className = "fixed bottom-8 right-8 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg w-16 h-16 flex items-center justify-center text-3xl focus:outline-none";
        fab.title = "Opprett enhet";
        fab.style.boxShadow = "0 4px 16px rgba(0,80,200,0.18)";
        fab.innerHTML = '<i data-lucide="plus" class="w-8 h-8"></i>';
        document.body.appendChild(fab);
        lucide.createIcons();
        // Bruker createDevice direkte, ikke showToast/showCreateDeviceModal/disableButtons
        fab.addEventListener('click', createDevice);
    }
}
