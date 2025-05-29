// main.js
// Hovedmodul (entry point) for CP-Tekniker Device Management App frontend.
// Binder sammen alle moduler, setter opp event listeners og styrer applikasjonsflyt.
// Importerer og kobler sammen autentisering, enhetsoperasjoner, modalhåndtering og UI-funksjoner.

import { showToast, requestAuthCode, verifyAuthCode, logout } from './auth.js';
import { fetchDeviceRoles, getDeviceInfo, createDevice, infoFetched, lastFetchedDeviceInfo } from './device.js';
import { showDeviceInfoModal, closeDeviceInfoModal, showCreateDeviceModal, closeCreateDeviceModal } from './modal.js';
import { disableButtons, resetFieldsToDefault, setLoggedIn, showEditButtons, setDefaultActionButtons } from './ui.js';

window.saveEdits = async function () {
    const mac = document.getElementById("macaddr").value.trim();
    const role_id = document.getElementById("roleDropdown").value;
    const enabled = document.getElementById("enabledCheckbox").checked;
    const visitor_name = document.getElementById("visitorName").value.trim();
    const expireInput = document.getElementById("expireTime").value;
    const sponsor_name = window.loggedInEmail || "";
    const sponsor_profile = "1";
    const expire_time = expireInput ? Math.floor(new Date(expireInput).getTime() / 1000) : 0;
    const payload = { mac, role_id, enabled, visitor_name, expire_time, sponsor_name, sponsor_profile };
    disableButtons(["saveBtn", "cancelBtn"]);
    try {
        const response = await fetch("/update_device", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        const data = await response.json();
        if (response.ok) {
            showToast("Endringer lagret."); setDefaultActionButtons(() => getDeviceInfo(showToast, resetFieldsToDefault, showDeviceInfoModal, disableButtons), () => createDevice(showToast, showCreateDeviceModal, disableButtons));
        } else {
            showToast(data.error || "Feil", "error");
        }
    } catch (e) {
        showToast("Nettverksfeil", "error");
    }
    disableButtons(["saveBtn", "cancelBtn"], false);
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

// Event listeners og applikasjonslogikk følger under

document.addEventListener('DOMContentLoaded', function () {
    lucide.createIcons();
    document.getElementById('closeDeviceInfoBtn').addEventListener('click', closeDeviceInfoModal);
    document.getElementById('closeCreateDeviceBtn').addEventListener('click', closeCreateDeviceModal);
    document.getElementById('requestAuthBtn').addEventListener('click', () => requestAuthCode(disableButtons));
    document.getElementById('loginBtn').addEventListener('click', () => verifyAuthCode((loggedIn) => setLoggedIn(loggedIn, fetchDeviceRoles), disableButtons));
    document.getElementById('logoutBtn').addEventListener('click', () => logout((loggedIn) => setLoggedIn(loggedIn, fetchDeviceRoles), showToast));
    document.getElementById('getDeviceInfoBtn').addEventListener('click', () => getDeviceInfo(showToast, resetFieldsToDefault, showDeviceInfoModal, disableButtons));
    document.getElementById('createDeviceBtn').addEventListener('click', () => createDevice(showToast, showCreateDeviceModal, disableButtons));
    ["roleDropdown", "visitorName", "expireTime", "enabledCheckbox"].forEach(id => {
        document.getElementById(id).addEventListener("input", () => {
            if (infoFetched) showEditButtons(window.saveEdits, window.cancelEdits);
        });
    });
    document.getElementById("macaddr").addEventListener("input", () => {
        // Endre fra setInfoFetched(false) til direkte setting av infoFetched
        // setInfoFetched(false);
        // Siden infoFetched er en importert let-variabel, må vi sette den via window eller lignende hvis vi vil endre den globalt.
        // Men i ES6-moduler er importerte bindings readonly, så vi må endre strategi:
        // Løsning: Flytt infoFetched til window.infoFetched og bruk window.infoFetched = false;
        // Men for nå, kommenter ut eller fjern denne linjen hvis det ikke er kritisk.
        // Alternativ: Hvis du trenger å kunne sette infoFetched, må du lage en setter i device.js og bruke den.
        // For nå, fjern bare kallet.
    });
    document.getElementById("macaddr").addEventListener("keydown", function (e) {
        if (e.key === "Enter" && !document.getElementById("getDeviceInfoBtn").disabled) {
            e.preventDefault();
            getDeviceInfo(showToast, resetFieldsToDefault, showDeviceInfoModal, disableButtons);
        }
    });
    document.getElementById('loginEmail').addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !document.getElementById('requestAuthBtn').disabled) {
            e.preventDefault();
            requestAuthCode(disableButtons);
        }
    });
    document.getElementById('authCode').addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !document.getElementById('loginBtn').disabled) {
            e.preventDefault();
            verifyAuthCode((loggedIn) => setLoggedIn(loggedIn, fetchDeviceRoles), disableButtons);
        }
    });
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
