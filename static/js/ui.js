// ui.js
// Hjelpemodul for brukergrensesnitt-funksjoner i CP-Tekniker Device Management App.
// Inneholder funksjoner for å vise/skjule knapper, tilbakestille felter, og håndtere visning av redigerings- og standardknapper.
import { addModalFabClose, removeModalFabClose } from './modal.js';

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
    // Fjern eksisterende FABs hvis de finnes
    const oldSaveFab = document.getElementById("saveFabBtn");
    const oldCancelFab = document.getElementById("cancelFabBtn");
    if (oldSaveFab) oldSaveFab.remove();
    if (oldCancelFab) oldCancelFab.remove();
    // Vis createDeviceBtn ikke i edit-modus
    const createDeviceBtn = document.getElementById("createDeviceBtn");
    if (createDeviceBtn) createDeviceBtn.style.display = "none";
    // Lagre FAB
    const saveFab = document.createElement("button");
    saveFab.id = "saveFabBtn";
    saveFab.className = "fixed bottom-8 right-24 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg w-16 h-16 flex items-center justify-center text-3xl focus:outline-none";
    saveFab.title = "Lagre endringer";
    saveFab.style.boxShadow = "0 4px 16px rgba(0,160,80,0.18)";
    saveFab.innerHTML = '<i data-lucide="save" class="w-8 h-8"></i>';
    saveFab.addEventListener("click", saveEdits);
    document.body.appendChild(saveFab);
    // Angre/Avbryt FAB (ikke felles lukkeknapp)
    const cancelFab = document.createElement("button");
    cancelFab.id = "cancelFabBtn";
    cancelFab.className = "fixed bottom-8 right-8 z-50 bg-gray-200 hover:bg-gray-300 text-black rounded-full shadow-lg w-16 h-16 flex items-center justify-center text-3xl border border-gray-400 focus:outline-none";
    cancelFab.title = "Angre endringer";
    cancelFab.style.boxShadow = "0 4px 16px rgba(80,80,80,0.12)";
    cancelFab.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>';
    cancelFab.addEventListener("click", cancelEdits);
    document.body.appendChild(cancelFab);
    lucide.createIcons();
    document.getElementById("macaddr").disabled = true;
}

/**
 * Viser standard handlingsknapper (Hent info/Opprett enhet) og kobler tilhørende callbacks.
 * @param {Function} getDeviceInfo - Callback for å hente enhetsinfo.
 * @param {Function} createDevice - Callback for å opprette enhet.
 */
// Sørg for at FAB alltid vises når standard action buttons settes
export function setDefaultActionButtons(getDeviceInfo, createDevice) {
    // Fjern eventuelle edit-FABs
    const oldSaveFab = document.getElementById("saveFabBtn");
    if (oldSaveFab) oldSaveFab.remove();
    removeModalFabClose("cancelFabBtn");
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
