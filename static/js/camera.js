// camera.js
// Modul for kamera-håndtering og OCR med Tesseract.js i CP-Tekniker Device Management App.

import { showCameraModal as _showCameraModal, closeCameraModal as _closeCameraModal } from './modal.js';

// Funksjon for å formatere MAC-adresse til ønsket format 11-11-11-22-22-22
function formatMacAddress(macAddress) {
    // Fjern alle separatorer og mellomrom, behold kun hex-tegn
    const cleanMac = macAddress.replace(/[^0-9A-Fa-f]/g, '');
    
    // Sjekk at vi har nøyaktig 12 tegn
    if (cleanMac.length !== 12) {
        return macAddress; // Returner original hvis ikke gyldig lengde
    }
    
    // Formater til xx-xx-xx-xx-xx-xx format med små bokstaver
    return cleanMac.match(/.{2}/g).join('-').toLowerCase();
}

let cameraStream = null;
// Variabler for ROI-dragging
let roiBox = null;
let isDragging = false;
let startPointer = { x: 0, y: 0 };
let boxStart = { x: 0, y: 0 };

// Wrapper for closing modal + stoppe kamera
function closeCameraModal() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(t => t.stop());
        cameraStream = null;
    }
    // Skjul FAB-bar og nullstill eventuelle tilstander
    const fabBar = document.getElementById('cameraFabBar');
    if (fabBar) fabBar.style.display = 'none';
    _closeCameraModal();
}

// Henter først bakkamera, deretter frontkamera, deretter hvilket som helst.
export async function getAnyCameraStream() {
    const options = [
        { video: { facingMode: { exact: 'environment' } } },
        { video: { facingMode: 'user' } },
        { video: true }
    ];
    for (const constraints of options) {
        try {
            return await navigator.mediaDevices.getUserMedia(constraints);
        } catch (_) {}
    }
    throw new Error('Kunne ikke finne noe kamera tilgjengelig');
}

export function stopCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
    const video = document.getElementById('cameraVideo');
    if (video) video.srcObject = null;
}

export async function restartPreview(video, canvas, status) {
    status.textContent = '';
    canvas.style.display = 'none';
    try {
        cameraStream = await getAnyCameraStream();
        video.srcObject = cameraStream;
        video.play();
    } catch (err) {
        status.textContent = 'Kunne ikke åpne kamera: ' + err.message;
    }
}

// Opprett eller oppdater flyttbar ROI-boks innenfor videokontainer
function createOrUpdateRoiBox(container) {
    if (!roiBox) {
        roiBox = document.createElement('div');
        roiBox.id = 'roiBox';
        const boxWidth = 200;
        const boxHeight = 50;
        Object.assign(roiBox.style, {
            position: 'absolute',
            border: '2px dashed red',
            width: boxWidth + 'px',
            height: boxHeight + 'px',
            cursor: 'move',
            boxSizing: 'border-box',
            zIndex: '10',
            pointerEvents: 'auto'
        });
        container.style.position = 'relative';
        container.appendChild(roiBox);
        // Initial sentrering av boksen
        const contRect = container.getBoundingClientRect();
        const initLeft = (contRect.width - boxWidth) / 2;
        const initTop = (contRect.height - boxHeight) / 2;
        roiBox.style.left = initLeft + 'px';
        roiBox.style.top = initTop + 'px';
        // Dragging via mus og touch
        roiBox.addEventListener('mousedown', (e) => {
            isDragging = true;
            startPointer.x = e.clientX;
            startPointer.y = e.clientY;
            boxStart.x = parseInt(roiBox.style.left, 10);
            boxStart.y = parseInt(roiBox.style.top, 10);
            e.preventDefault();
        });
        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const dx = e.clientX - startPointer.x;
                const dy = e.clientY - startPointer.y;
                const contRectLive = container.getBoundingClientRect();
                let newLeft = boxStart.x + dx;
                let newTop = boxStart.y + dy;
                newLeft = Math.max(0, Math.min(newLeft, contRectLive.width - roiBox.clientWidth));
                newTop = Math.max(0, Math.min(newTop, contRectLive.height - roiBox.clientHeight));
                roiBox.style.left = newLeft + 'px';
                roiBox.style.top = newTop + 'px';
            }
        });
        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
        roiBox.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            isDragging = true;
            startPointer.x = touch.clientX;
            startPointer.y = touch.clientY;
            boxStart.x = parseInt(roiBox.style.left, 10);
            boxStart.y = parseInt(roiBox.style.top, 10);
            e.preventDefault();
        }, { passive: false });
        document.addEventListener('touchmove', (e) => {
            if (isDragging) {
                const touch = e.touches[0];
                const dx = touch.clientX - startPointer.x;
                const dy = touch.clientY - startPointer.y;
                const contRectLive = container.getBoundingClientRect();
                let newLeft = boxStart.x + dx;
                let newTop = boxStart.y + dy;
                newLeft = Math.max(0, Math.min(newLeft, contRectLive.width - roiBox.clientWidth));
                newTop = Math.max(0, Math.min(newTop, contRectLive.height - roiBox.clientHeight));
                roiBox.style.left = newLeft + 'px';
                roiBox.style.top = newTop + 'px';
                e.preventDefault();
            }
        }, { passive: false });
        document.addEventListener('touchend', () => {
            isDragging = false;
        });
    }
}

// Gjør kraftig OCR-prosess: crop til ROI, stopp kamera, kjør Tesseract
export async function captureAndRunOcr(video, canvas, statusElement) {
    statusElement.textContent = 'Kjører OCR…';

    // Finn ROI og kalkuler beskjæringskoordinater
    const videoRect = video.getBoundingClientRect();
    const roiRect = roiBox.getBoundingClientRect();
    const scaleX = video.videoWidth / videoRect.width;
    const scaleY = video.videoHeight / videoRect.height;
    const sx = (roiRect.left - videoRect.left) * scaleX;
    const sy = (roiRect.top - videoRect.top) * scaleY;
    const sw = roiRect.width * scaleX;
    const sh = roiRect.height * scaleY;

    // Crop til ROI i canvas
    canvas.width = sw;
    canvas.height = sh;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, sw, sh);
    canvas.style.display = 'block';

    // Stopp kamera-strøm
    stopCamera();
    try {
        const result = await Tesseract.recognize(canvas, 'nor+eng', {
            tessedit_ocr_engine_mode: Tesseract.OEM.LSTM_ONLY,
            tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK,
            tessedit_char_whitelist: '0123456789ABCDEFabcdef:-'
        });
        return result.data.text;
    } catch (err) {
        throw new Error('OCR-feil: ' + err.message);
    }
}

// Åpner camera-modal, setter opp stream, ROI og knapper
export async function openCameraModal() {
    _showCameraModal();

    // Vis FAB-bar eksplisitt hver gang modal åpnes
    const fabBar = document.getElementById('cameraFabBar');
    if (fabBar) {
        // Fjern eventuell Tailwind-klasse som gir right-8:
        fabBar.classList.remove('right-8');
        // Sett posisjon slik at knappen ligger bottom:2rem (right:5rem)
        fabBar.style.bottom   = '2rem';  // tilsvarer Tailwind bottom-8
        fabBar.style.right    = '6rem';  // tilsvarer Tailwind right-20
        fabBar.style.display  = 'flex';
    }

    const video = document.getElementById('cameraVideo');
    const canvas = document.getElementById('cameraCanvas');
    const status = document.getElementById('cameraStatus');
    status.textContent = '';
    canvas.style.display = 'none';

    createOrUpdateRoiBox(video.parentElement);

    try {
        cameraStream = await getAnyCameraStream();
        video.srcObject = cameraStream;
        video.play();
    } catch (err) {
        status.textContent = 'Kunne ikke åpne kamera: ' + err.message;
        return;
    }

    // Håndter lukking via ESC eller overlay-click
    const cameraModal = document.getElementById('cameraModal');
    function escListener(e) {
        if (e.key === 'Escape') closeCameraModal();
    }
    function overlayListener(e) {
        if (e.target === cameraModal) closeCameraModal();
    }
    document.addEventListener('keydown', escListener);
    cameraModal.addEventListener('click', overlayListener);

    // Koble FAB‐OCR‐knapp
    const fabOcrBtn = document.getElementById('cameraFabOcr');
    if (fabOcrBtn) {
        fabOcrBtn.onclick = async () => {
            await handleOcrClick();
        };
    }

    // Koble FAB‐Lukk‐knapp
    const fabCloseBtn = document.getElementById('cameraFabClose');
    if (fabCloseBtn) {
        fabCloseBtn.onclick = () => closeCameraModal();
    }

    async function handleOcrClick() {
        if (fabOcrBtn) fabOcrBtn.disabled = true;
        try {
            const text = await captureAndRunOcr(video, canvas, status);
            //const macRegex = /(?:(?:[0-9-A-Fa-f]{2}([:-]))(?:[0-9-A-Fa-f]{2}\1){4}[0-9-A-Fa-f]{2}|(?:[0-9A-Fa-f]{4}\.){2}[0-9-A-Fa-f]{4}|[0-9-A-Fa-f]{6}-[0-9-A-Fa-f]{6})/g;
            const macRegex = /(?:(?:[0-9A-Fa-f]{2}([:-])(?:[0-9A-Fa-f]{2}\1){4}[0-9A-Fa-f]{2})|(?:[0-9A-Fa-f]{4}\.){2}[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}-[0-9A-Fa-f]{6}|(?:[0-9A-Fa-f]{2}(?: [0-9A-Fa-f]{2}){5})|[0-9A-Fa-f]{12}|[0-9A-Fa-f]{6} +[0-9A-Fa-f]{6}|[0-9A-Fa-f]{6}\s*:\s*[0-9A-Fa-f]{6})/g;
            const matches = text.match(macRegex);
            if (matches && matches.length > 0) {
                document.getElementById('macaddr').value = formatMacAddress(matches[0]);
                status.textContent = 'MAC-adresse funnet og formatert!';
                document.removeEventListener('keydown', escListener);
                cameraModal.removeEventListener('click', overlayListener);
                setTimeout(closeCameraModal, 1000);
            } else {
                status.textContent = 'Fant ingen MAC-adresse.';
                setTimeout(() => restartPreview(video, canvas, status), 3000);
            }
        } catch (err) {
            status.textContent = err.message;
        } finally {
            if (fabOcrBtn) fabOcrBtn.disabled = false;
        }
    }
}