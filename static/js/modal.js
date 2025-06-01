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
}

/**
 * Skjuler modal for enhetsinformasjon.
 */
export function closeDeviceInfoModal() {
    const modal = document.getElementById("deviceInfoModal");
    modal.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
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
}

/**
 * Skjuler modal for opprettelse av enhet.
 */
export function closeCreateDeviceModal() {
    const modal = document.getElementById("createDeviceModal");
    modal.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
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
