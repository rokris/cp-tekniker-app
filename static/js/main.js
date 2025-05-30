// main.js
// Hovedmodul (entry point) for CP-Tekniker Device Management App frontend.
// Binder sammen alle moduler, setter opp event listeners og styrer applikasjonsflyt.
// Importerer og kobler sammen autentisering, enhetsoperasjoner, modalhåndtering og UI-funksjoner.

import { showToast, requestAuthCode, verifyAuthCode, logout } from './auth.js';
import { fetchDeviceRoles, getDeviceInfo, createDevice, infoFetched, lastFetchedDeviceInfo, setInfoFetched, updateDevice, setDeviceFieldsReadonly } from './device.js';
import { showDeviceInfoModal as _showDeviceInfoModal, closeDeviceInfoModal as _closeDeviceInfoModal, showCreateDeviceModal as _showCreateDeviceModal, closeCreateDeviceModal as _closeCreateDeviceModal } from './modal.js';
import { disableButtons, resetFieldsToDefault, setLoggedIn, showEditButtons, setDefaultActionButtons } from './ui.js';

window.saveEdits = async function () {
    // Kall updateDevice (PATCH) i stedet for å gjøre POST her
    const result = await updateDevice(showToast, disableButtons);
    if (result) {
        setDefaultActionButtons(
            () => getDeviceInfo(showToast, resetFieldsToDefault, showDeviceInfoModal, disableButtons),
            () => createDevice(showToast, showCreateDeviceModal, disableButtons)
        );
        setInfoFetched(false);
    }
};

window.cancelEdits = function () {
    const d = lastFetchedDeviceInfo;
    document.getElementById("roleDropdown").value = d.role_id || "";
    document.getElementById("visitorName").value = d.visitor_name || "";
    if (d.expire_time) {
        const dt = new Date(d.expire_time * 1000);
        const pad = n => n.toString().padStart(2, '0');
        document.getElementById("expireTime").value = `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
    } else {
        document.getElementById("expireTime").value = "";
    }
    document.getElementById("enabledCheckbox").checked = typeof d.enabled != "undefined" ? !!d.enabled : true;
    document.getElementById("sponsorName").value = d.sponsor_name || "";
    setDefaultActionButtons(() => getDeviceInfo(showToast, resetFieldsToDefault, showDeviceInfoModal, disableButtons), () => createDevice(showToast, showCreateDeviceModal, disableButtons));
};

// Hjelpefunksjoner for å enable/disable Enter-funksjonalitet på loginEmail og authCode
let loginEmailEnterHandler = null;
let authCodeEnterHandler = null;

function enableLoginEnter() {
    const loginEmail = document.getElementById('loginEmail');
    if (!loginEmailEnterHandler) {
        loginEmailEnterHandler = function(e) {
            // Bare tillat Enter hvis loginModal er synlig og ingen andre modaler er åpne
            const loginModal = document.getElementById('loginModal');
            const deviceInfoModal = document.getElementById('deviceInfoModal');
            const createDeviceModal = document.getElementById('createDeviceModal');
            if (
                e.key === 'Enter' &&
                !document.getElementById('requestAuthBtn').disabled &&
                !loginModal.classList.contains('hidden') &&
                deviceInfoModal.classList.contains('hidden') &&
                createDeviceModal.classList.contains('hidden')
            ) {
                e.preventDefault();
                requestAuthCode(disableButtons);
            }
        };
        loginEmail.addEventListener('keydown', loginEmailEnterHandler);
    }
}
function disableLoginEnter() {
    const loginEmail = document.getElementById('loginEmail');
    if (loginEmailEnterHandler) {
        loginEmail.removeEventListener('keydown', loginEmailEnterHandler);
        loginEmailEnterHandler = null;
    }
}
function enableAuthCodeEnter() {
    const authCode = document.getElementById('authCode');
    if (!authCodeEnterHandler) {
        authCodeEnterHandler = function(e) {
            // Bare tillat Enter hvis loginModal er synlig og ingen andre modaler er åpne
            const loginModal = document.getElementById('loginModal');
            const deviceInfoModal = document.getElementById('deviceInfoModal');
            const createDeviceModal = document.getElementById('createDeviceModal');
            if (
                e.key === 'Enter' &&
                !document.getElementById('loginBtn').disabled &&
                !loginModal.classList.contains('hidden') &&
                deviceInfoModal.classList.contains('hidden') &&
                createDeviceModal.classList.contains('hidden')
            ) {
                e.preventDefault();
                verifyAuthCode((loggedIn) => setLoggedIn(loggedIn, fetchDeviceRoles), disableButtons);
            }
        };
        authCode.addEventListener('keydown', authCodeEnterHandler);
    }
}
function disableAuthCodeEnter() {
    const authCode = document.getElementById('authCode');
    if (authCodeEnterHandler) {
        authCode.removeEventListener('keydown', authCodeEnterHandler);
        authCodeEnterHandler = null;
    }
}

// Wrap modal show/hide for å disable/enable Enter-funksjonalitet
export function showDeviceInfoModal(data) {
    disableLoginEnter();
    disableAuthCodeEnter();
    _showDeviceInfoModal(data);
}
export function closeDeviceInfoModal() {
    _closeDeviceInfoModal();
    enableLoginEnter();
    enableAuthCodeEnter();
}
export function showCreateDeviceModal(data) {
    disableLoginEnter();
    disableAuthCodeEnter();
    _showCreateDeviceModal(data);
}
export function closeCreateDeviceModal() {
    _closeCreateDeviceModal();
    enableLoginEnter();
    enableAuthCodeEnter();
}

document.addEventListener('DOMContentLoaded', function () {
    lucide.createIcons();
    enableLoginEnter();
    enableAuthCodeEnter();
    document.getElementById('closeDeviceInfoBtn').addEventListener('click', closeDeviceInfoModal);
    document.getElementById('closeCreateDeviceBtn').addEventListener('click', closeCreateDeviceModal);
    document.getElementById('requestAuthBtn').addEventListener('click', () => requestAuthCode(disableButtons));
    document.getElementById('loginBtn').addEventListener('click', () => verifyAuthCode((loggedIn) => setLoggedIn(loggedIn, fetchDeviceRoles), disableButtons));
    document.getElementById('logoutBtn').addEventListener('click', () => logout((loggedIn) => setLoggedIn(loggedIn, fetchDeviceRoles), showToast));
    document.getElementById('getDeviceInfoBtn').addEventListener('click', () => getDeviceInfo(showToast, resetFieldsToDefault, showDeviceInfoModal, disableButtons));
    // Ikke legg til createDeviceBtn her, FAB håndteres av setDefaultActionButtons
    ["roleDropdown", "visitorName", "expireTime", "enabledCheckbox"].forEach(id => {
        const el = document.getElementById(id);
        if (el.tagName === 'SELECT' || el.type === 'checkbox') {
            el.addEventListener("change", () => {
                // Ikke trigge edit-modus hvis info ikke er hentet
                if (infoFetched && !el.readOnly && !el.disabled && !document.getElementById("saveBtn") && !document.getElementById("cancelBtn")) {
                    showEditButtons(window.saveEdits, window.cancelEdits);
                }
            });
        } else {
            el.addEventListener("input", () => {
                if (infoFetched && !el.readOnly && !el.disabled && !document.getElementById("saveBtn") && !document.getElementById("cancelBtn")) {
                    showEditButtons(window.saveEdits, window.cancelEdits);
                }
            });
        }
    });
    document.getElementById("macaddr").addEventListener("input", () => {
        setInfoFetched(false);
        setDeviceFieldsReadonly(false);
        resetFieldsToDefault();
        const dropdown = document.getElementById("roleDropdown");
        Array.from(dropdown.querySelectorAll('option[data-unknown-role]')).forEach(opt => opt.remove());
        if (dropdown.options.length > 0) {
            dropdown.value = dropdown.options[0].value;
        }
    });
    document.getElementById("macaddr").addEventListener("keydown", function (e) {
        const deviceInfoModal = document.getElementById('deviceInfoModal');
        const createDeviceModal = document.getElementById('createDeviceModal');
        if (
            e.key === "Enter" &&
            !document.getElementById("getDeviceInfoBtn").disabled &&
            deviceInfoModal.classList.contains('hidden') &&
            createDeviceModal.classList.contains('hidden')
        ) {
            e.preventDefault();
            getDeviceInfo(showToast, resetFieldsToDefault, showDeviceInfoModal, disableButtons);
        }
    });
    // Sørg for at FAB alltid finnes etter login/refresh
    setDefaultActionButtons(() => getDeviceInfo(showToast, resetFieldsToDefault, showDeviceInfoModal, disableButtons), () => createDevice(showToast, showCreateDeviceModal, disableButtons));
});

window.onload = async () => {
    try {
        const response = await fetch("/is_logged_in");
        const data = await response.json();
        setLoggedIn(data.logged_in === true, fetchDeviceRoles);
    } catch {
        setLoggedIn(false, fetchDeviceRoles);
    }
};
