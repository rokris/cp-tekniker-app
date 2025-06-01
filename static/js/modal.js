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
    addModalFabClose("deviceInfoFabClose", closeDeviceInfoModal);
}

/**
 * Skjuler modal for enhetsinformasjon.
 */
export function closeDeviceInfoModal() {
    const modal = document.getElementById("deviceInfoModal");
    modal.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
    removeModalFabClose("deviceInfoFabClose");
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
    addModalFabClose("createDeviceFabClose", closeCreateDeviceModal);
}

/**
 * Skjuler modal for opprettelse av enhet.
 */
export function closeCreateDeviceModal() {
    const modal = document.getElementById("createDeviceModal");
    modal.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
    removeModalFabClose("createDeviceFabClose");
}

/**
 * Viser kamera/OCR-modal.
 */
export function showCameraModal() {
    const modal = document.getElementById("cameraModal");
    modal.classList.remove("hidden");
    document.body.classList.add("overflow-hidden");
    addModalFabClose("cameraFabClose", closeCameraModal);
}

/**
 * Skjuler kamera/OCR-modal.
 */
export function closeCameraModal() {
    const modal = document.getElementById("cameraModal");
    modal.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
    removeModalFabClose("cameraFabClose");
}

/**
 * Viser login-modal.
 */
export function showLoginModal() {
    const modal = document.getElementById("loginModal");
    modal.classList.remove("hidden");
    document.body.classList.add("overflow-hidden");
    addModalFabClose("loginFabClose", closeLoginModal);
}

/**
 * Skjuler login-modal.
 */
export function closeLoginModal() {
    const modal = document.getElementById("loginModal");
    modal.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
    removeModalFabClose("loginFabClose");
}

/**
 * Lager en gjenbrukbar FAB-lukkeknapp for modaler.
 * @param {string} fabId - Unik id for FAB.
 * @param {function} closeFn - Funksjon som skal kalles ved klikk.
 */
function addModalFabClose(fabId, closeFn) {
    if (!document.getElementById(fabId)) {
        const fab = document.createElement("button");
        fab.id = fabId;
        fab.title = "Lukk";
        fab.type = "button";
        fab.setAttribute('aria-label', 'Lukk');
        fab.className = "fixed bottom-8 right-8 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg p-4 flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-white";
        fab.style.zIndex = "2147483647";
        fab.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>';
        fab.onclick = function(e) {
            e.stopPropagation();
            closeFn();
        };
        document.body.appendChild(fab);
    }
}

function removeModalFabClose(fabId) {
    const fab = document.getElementById(fabId);
    if (fab) fab.remove();
}
