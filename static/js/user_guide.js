// user_guide.js
// Håndterer visning og lasting av brukerveiledning i modal.
import { addModalFabClose, removeModalFabClose } from './modal.js';

document.addEventListener('DOMContentLoaded', () => {
    const helpBtn = document.getElementById('helpBtn');
    const helpModal = document.getElementById('helpModal');
    const helpContent = document.getElementById('helpContent');
    const helpIframeError = document.getElementById('helpIframeError');

    function closeHelpModal() {
        helpModal.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
        removeModalFabClose('helpFabClose');
    }

    if (helpBtn && helpModal) {
        helpBtn.onclick = () => {
            helpModal.classList.remove('hidden');
            document.body.classList.add('overflow-hidden');
            addModalFabClose('helpFabClose', closeHelpModal);
            // Hent brukerveiledning og sett inn i modalen
            fetch('/static/user_guide.html')
                .then(res => res.ok ? res.text() : Promise.reject())
                .then(html => {
                    const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
                    helpContent.innerHTML = bodyMatch ? bodyMatch[1] : html;
                    helpContent.classList.remove('hidden');
                    helpContent.style.overflowY = 'auto'; // Legg til vertikal scrollbar
                    helpContent.style.maxHeight = '70vh'; // Sikre at scrollbaren vises ved behov
                    if (helpIframeError) helpIframeError.classList.add('hidden');
                })
                .catch(() => {
                    helpContent.classList.add('hidden');
                    if (helpIframeError) helpIframeError.classList.remove('hidden');
                });
        };
    }
    // Lukk på overlay-click
    if (helpModal) {
        helpModal.addEventListener('click', (e) => {
            if (e.target === helpModal) closeHelpModal();
        });
        // Lukk på ESC
        window.addEventListener('keydown', function helpEscListener(e) {
            if (!helpModal.classList.contains('hidden') && e.key === 'Escape') closeHelpModal();
        });
    }
});
