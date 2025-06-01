// modal.js
// Modul for håndtering av modaler i CP-Tekniker Device Management App.
// Viser og skjuler modaler for enhetsinfo og opprettelse av enhet.

/**
 * Viser modal med detaljert enhetsinformasjon.
 * @param {object} data - Enhetsdata som skal vises.
 */
export function showDeviceInfoModal(data) {
    const modal = document.getElementById("deviceInfoModal");
    const content = document.getElementById("deviceInfoPopupContent");
    content.textContent = JSON.stringify(data, null, 2);
    modal.classList.remove("hidden");
    document.body.classList.add("overflow-hidden");

    // Legg til FAB for lukk hvis ikke allerede lagt til
    if (!document.getElementById("deviceInfoFabClose")) {
        const fab = document.createElement("button");
        fab.id = "deviceInfoFabClose";
        fab.title = "Lukk";
        fab.type = "button";
        fab.setAttribute('aria-label', 'Lukk');
        fab.className = "fixed bottom-8 right-8 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg p-4 flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-white";
        fab.style.zIndex = "2147483647"; // Ekstremt høy z-index for å alltid ligge øverst
        fab.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>';
        fab.onclick = function(e) {
            e.stopPropagation();
            closeDeviceInfoModal();
        };
        document.body.appendChild(fab);
    }
}

/**
 * Skjuler modal for enhetsinformasjon.
 */
export function closeDeviceInfoModal() {
    const modal = document.getElementById("deviceInfoModal");
    modal.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");

    // Fjern FAB for lukk hvis den eksisterer
    const fab = document.getElementById("deviceInfoFabClose");
    if (fab) {
        fab.remove();
    }
}

/**
 * Viser modal med resultat etter opprettelse av enhet.
 * @param {object} data - Resultatdata som skal vises.
 */
export function showCreateDeviceModal(data) {
    const modal = document.getElementById("createDeviceModal");
    const content = document.getElementById("createDevicePopupContent");
    content.textContent = JSON.stringify(data, null, 2);
    modal.classList.remove("hidden");
    document.body.classList.add("overflow-hidden");
    // Legg til FAB for lukk hvis ikke allerede lagt til
    if (!document.getElementById("createDeviceFabClose")) {
        const fab = document.createElement("button");
        fab.id = "createDeviceFabClose";
        fab.title = "Lukk";
        fab.type = "button";
        fab.setAttribute('aria-label', 'Lukk');
        fab.className = "fixed bottom-8 right-8 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg p-4 flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-white";
        fab.style.zIndex = "2147483647";
        fab.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>';
        fab.onclick = function(e) {
            e.stopPropagation();
            closeCreateDeviceModal();
        };
        document.body.appendChild(fab);
    }
}

/**
 * Skjuler modal for opprettelse av enhet.
 */
export function closeCreateDeviceModal() {
    const modal = document.getElementById("createDeviceModal");
    modal.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
    // Fjern FAB for lukk hvis den eksisterer
    const fab = document.getElementById("createDeviceFabClose");
    if (fab) {
        fab.remove();
    }
}

/**
 * Viser kamera/OCR-modal.
 */
export function showCameraModal() {
    const modal = document.getElementById("cameraModal");
    modal.classList.remove("hidden");
    document.body.classList.add("overflow-hidden");
}

/**
 * Skjuler kamera/OCR-modal.
 */
export function closeCameraModal() {
    const modal = document.getElementById("cameraModal");
    modal.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
}

/**
 * Viser login-modal.
 */
export function showLoginModal() {
    const modal = document.getElementById("loginModal");
    modal.classList.remove("hidden");
    document.body.classList.add("overflow-hidden");
}

/**
 * Skjuler login-modal.
 */
export function closeLoginModal() {
    const modal = document.getElementById("loginModal");
    modal.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
}
