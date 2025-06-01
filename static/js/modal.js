// modal.js
// Modul for håndtering av modaler i CP-Tekniker Device Management App.
// Samler visning/skjuling av modal i generiske funksjoner, samt ESC- og overlay-lukking.

///////////////////////
// Generiske hjelpefunksjoner
///////////////////////

/**
 * Vis modal.
 * @param {string} modalId    - ID på modal-«overlay»-elementet.
 * @param {string|null} contentId - ID på element i modal der JSON-data skal vises (eller null om ingen).
 * @param {object|null} data  - Data som skal vises som prettify-json (eller null).
 * @param {string} fabId      - ID for FAB-lukkeknapp.
 * @param {Function} closeFn  - Funksjon som lukker denne modalen.
 */
function _showModal({ modalId, contentId = null, data = null, fabId, closeFn }) {
    const modal = document.getElementById(modalId);
    if (!modal) {
        console.warn(`Kunne ikke finne modal med ID "${modalId}"`);
        return;
    }

    // Hvis det er et content-element og data, vis JSON
    if (contentId && data !== null) {
        const content = document.getElementById(contentId);
        if (content) {
            content.textContent = JSON.stringify(data, null, 2);
        }
    }

    // Vis modal + lås bakgrunnsskrolling
    modal.classList.remove("hidden");
    document.body.classList.add("overflow-hidden");

    // Legg til FAB-knappen øverst (kun én gang)
    addModalFabClose(fabId, closeFn);

    // Sett opp klikk-på-overlay-for-å-lukke
    modal.addEventListener("click", (e) => {
        // e.target === modal betyr at man klikket direkte på overlay, ikke på innhold
        if (e.target === modal) {
            closeFn();
        }
    });

    // Lytt etter ESC
    window.addEventListener("keydown", closeOnEscape);

    function closeOnEscape(e) {
        if (e.key === "Escape") {
            closeFn();
        }
    }

    // Legg funsjon som fjerner event-lytter når modal lukkes
    // Vi antar at closeFn vil kalle _closeModal, og at da fjernes listener.
    modal._escListener = closeOnEscape;
}

/**
 * Skjul modal.
 * @param {string} modalId  - ID på modal-«overlay»-elementet.
 * @param {string} fabId    - ID for FAB-knapp som skal fjernes.
 */
function _closeModal({ modalId, fabId }) {
    const modal = document.getElementById(modalId);
    if (!modal) {
        console.warn(`Kunne ikke finne modal med ID "${modalId}"`);
        return;
    }

    modal.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");

    // Fjern FAB-knapp
    removeModalFabClose(fabId);

    // Fjern ESC-lytter som ble satt i _showModal
    if (modal._escListener) {
        window.removeEventListener("keydown", modal._escListener);
        delete modal._escListener;
    }
}

///////////////////////
// Spesifikke eksporterte funksjoner
///////////////////////

/**
 * Viser modal med detaljert enhetsinformasjon.
 * @param {object} data - Enhetsdata som skal vises.
 */
export function showDeviceInfoModal(data) {
    _showModal({
        modalId: "deviceInfoModal",
        contentId: "deviceInfoPopupContent",
        data,
        fabId: "deviceInfoFabClose",
        closeFn: closeDeviceInfoModal
    });
}

/**
 * Skjuler modal for enhetsinformasjon.
 */
export function closeDeviceInfoModal() {
    _closeModal({
        modalId: "deviceInfoModal",
        fabId: "deviceInfoFabClose"
    });
}

/**
 * Viser modal med resultat etter opprettelse av enhet.
 * @param {object} data - Resultatdata som skal vises.
 */
export function showCreateDeviceModal(data) {
    _showModal({
        modalId: "createDeviceModal",
        contentId: "createDevicePopupContent",
        data,
        fabId: "createDeviceFabClose",
        closeFn: closeCreateDeviceModal
    });
}

/**
 * Skjuler modal for opprettelse av enhet.
 */
export function closeCreateDeviceModal() {
    _closeModal({
        modalId: "createDeviceModal",
        fabId: "createDeviceFabClose"
    });
}

/**
 * Viser kamera/OCR-modal (ingen data-JSON her).
 */
export function showCameraModal() {
    _showModal({
        modalId: "cameraModal",
        contentId: null,
        data: null,
        fabId: "cameraFabClose",
        closeFn: closeCameraModal
    });
    // Skjul de gamle knappene hvis de finnes
    //const ocrBtn = document.getElementById('cameraOcrBtn');
    //const cancelBtn = document.getElementById('cameraCancelBtn');
    //if (ocrBtn) ocrBtn.style.display = 'none';
    //if (cancelBtn) cancelBtn.style.display = 'none';
}

/**
 * Skjuler kamera/OCR-modal.
 */
export function closeCameraModal() {
    _closeModal({
        modalId: "cameraModal",
        fabId: "cameraFabClose"
    });
    // Vis de gamle knappene igjen hvis de finnes
    //const ocrBtn = document.getElementById('cameraOcrBtn');
    //const cancelBtn = document.getElementById('cameraCancelBtn');
    //if (ocrBtn) ocrBtn.style.display = '';
    //if (cancelBtn) cancelBtn.style.display = '';
}

/**
 * Viser login-modal.
 */
export function showLoginModal() {
    _showModal({
        modalId: "loginModal",
        contentId: null,
        data: null,
        fabId: "loginFabClose",
        closeFn: closeLoginModal
    });
}

/**
 * Skjuler login-modal.
 */
export function closeLoginModal() {
    _closeModal({
        modalId: "loginModal",
        fabId: "loginFabClose"
    });
}

///////////////////////
// FAB-knapp for lukking av modal
///////////////////////

/**
 * Lager en gjenbrukbar FAB-lukkeknapp for modaler.
 * @param {string} fabId    - Unik ID for denne FAB-knappen.
 * @param {Function} closeFn - Funksjon som kalles når man klikker på FAB.
 */
function addModalFabClose(fabId, closeFn) {
    if (document.getElementById(fabId)) return; // allerede lagt til

    const fab = document.createElement("button");
    fab.id = fabId;
    fab.title = "Lukk";
    fab.type = "button";
    fab.setAttribute("aria-label", "Lukk");
    // Du kan alternativt sette èn CSS-klasse her og definere stilen i CSS-fil.
    fab.className =
        "fixed bottom-8 right-8 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg p-4 flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-white";
    fab.style.zIndex = "2147483647";
    fab.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>';
    fab.onclick = function (e) {
        e.stopPropagation();
        closeFn();
    };
    document.body.appendChild(fab);
}

/**
 * Fjerner FAB-lukkeknappen med gitt ID.
 * @param {string} fabId - ID for FAB som skal fjernes.
 */
function removeModalFabClose(fabId) {
    const fab = document.getElementById(fabId);
    if (fab) fab.remove();
}