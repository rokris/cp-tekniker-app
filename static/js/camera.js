// camera.js
// Modul for kamera-håndtering og OCR med Tesseract.js i CP-Tekniker Device Management App.

import { showCameraModal as _showCameraModal, closeCameraModal as _closeCameraModal } from './modal.js';

let cameraStream = null;

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
        } catch (_) {
            // Prøv neste
        }
    }
    throw new Error('Kunne ikke finne noe kamera tilgjengelig');
}

export function stopCameraStream() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(t => t.stop());
        cameraStream = null;
    }
    const video = document.getElementById('cameraVideo');
    if (video) video.srcObject = null;
}

export async function restartPreview(video, canvas, status, ocrBtn) {
    status.textContent = '';
    canvas.style.display = 'none';
    ocrBtn.style.display = '';
    try {
        cameraStream = await getAnyCameraStream();
        video.srcObject = cameraStream;
        video.play();
    } catch (err) {
        status.textContent = 'Kunne ikke åpne kamera: ' + err.message;
    }
}

export async function captureAndRunOcr(video, canvas, statusElement) {
    statusElement.textContent = 'Kjører OCR…';
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.style.display = 'block';
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
    }
    try {
        const result = await Tesseract.recognize(canvas, 'nor+eng');
        return result.data.text;
    } catch (err) {
        throw new Error('OCR-feil: ' + err.message);
    }
}

export async function openCameraModal() {
    _showCameraModal();
    const video = document.getElementById('cameraVideo');
    const canvas = document.getElementById('cameraCanvas');
    const ocrBtn = document.getElementById('cameraOcrBtn');
    const cancelBtn = document.getElementById('cameraCancelBtn');
    const status = document.getElementById('cameraStatus');
    status.textContent = '';
    canvas.style.display = 'none';
    ocrBtn.style.display = '';
    cancelBtn.style.display = '';
    try {
        cameraStream = await getAnyCameraStream();
        video.srcObject = cameraStream;
        video.play();
    } catch (err) {
        status.textContent = 'Kunne ikke åpne kamera: ' + err.message;
        return;
    }
    ocrBtn.onclick = async () => {
        ocrBtn.style.display = 'none';
        try {
            const text = await captureAndRunOcr(video, canvas, status);
            const macRegex = /(?:(?:[0-9A-Fa-f]{2}([:-]))(?:[0-9A-Fa-f]{2}\1){4}[0-9A-Fa-f]{2}|(?:[0-9A-Fa-f]{4}\.){2}[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}-[0-9A-Fa-f]{6})/g;
            const matches = text.match(macRegex);
            if (matches && matches.length > 0) {
                document.getElementById('macaddr').value = matches[0];
                status.textContent = 'MAC-adresse funnet!';
                setTimeout(_closeCameraModal, 1000);
            } else {
                status.textContent = 'Fant ingen MAC-adresse.';
                setTimeout(() => restartPreview(video, canvas, status, ocrBtn), 3000);
            }
        } catch (err) {
            status.textContent = err.message;
            ocrBtn.style.display = '';
        }
    };
    cancelBtn.onclick = _closeCameraModal;
}
