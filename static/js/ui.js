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
    <button id="saveBtn" class="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg">Lagre</button>
    <button id="cancelBtn" class="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg">Avbryt</button>
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
export function setDefaultActionButtons(getDeviceInfo, createDevice) {
    const actionDiv = document.getElementById("actionButtons");
    // Fjern "ukjent rolle" fra dropdown før standard handling
    const dropdown = document.getElementById("roleDropdown");
    const unknownOpt = dropdown.querySelector('option[data-unknown-role]');
    if (unknownOpt) unknownOpt.remove();
    actionDiv.innerHTML = `
    <button id="getDeviceInfoBtn" class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg">Hent info</button>
    <button id="createDeviceBtn" class="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg">Opprett enhet</button>
  `;
    document.getElementById("macaddr").disabled = false;
    document.getElementById("getDeviceInfoBtn").addEventListener("click", getDeviceInfo);
    document.getElementById("createDeviceBtn").addEventListener("click", createDevice);
}
