// device.js
// Modul for enhetsoperasjoner i CP-Tekniker Device Management App.
// Håndterer henting av roller, enhetsinformasjon og opprettelse av enhet.

/**
 * Status for om enhetsinfo er hentet.
 * @type {boolean}
 */
export let infoFetched = false;

/**
 * Siste hentede enhetsinfo.
 * @type {object|null}
 */
export let lastFetchedDeviceInfo = null;

/**
 * Henter roller fra backend og fyller nedtrekksmeny.
 * @param {Function} showToast - Funksjon for å vise feilmelding.
 */
export async function fetchDeviceRoles(showToast) {
    try {
        const response = await fetch("/GetDeviceRoles");
        const data = await response.json();
        const dropdown = document.getElementById("roleDropdown");
        dropdown.innerHTML = "";
        (data._embedded?.items || data || []).forEach(role => {
            const option = document.createElement("option");
            option.value = role.role_id || role.id || role.name;
            option.textContent = role.name;
            dropdown.appendChild(option);
        });
    } catch {
        showToast("Feil ved henting av roller", "error");
    }
}

/**
 * Henter enhetsinformasjon basert på MAC-adresse og fyller ut skjemaet.
 * @param {Function} showToast - Funksjon for tilbakemelding.
 * @param {Function} resetFieldsToDefault - Tilbakestillingsfunksjon for felter.
 * @param {Function} showDeviceInfoModal - Funksjon for å vise modal med info.
 * @param {Function} disableButtons - Funksjon for å deaktivere knapper.
 */
export async function getDeviceInfo(showToast, resetFieldsToDefault, showDeviceInfoModal, disableButtons) {
    const macaddr = document.getElementById("macaddr").value;
    showToast("Laster...");
    disableButtons(["getDeviceInfoBtn", "createDeviceBtn"]);
    try {
        const response = await fetch(`/get_device_info?macaddr=${encodeURIComponent(macaddr)}`);
        const data = await response.json();
        if (response.ok) {
            showDeviceInfoModal(data);
            document.getElementById("roleDropdown").value = data.role_id || "";
            document.getElementById("visitorName").value = data.visitor_name || "";
            if (data.expire_time) {
                const dt = new Date(data.expire_time * 1000);
                const pad = n => n.toString().padStart(2, '0');
                document.getElementById("expireTime").value = `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
            } else {
                document.getElementById("expireTime").value = "";
            }
            document.getElementById("enabledCheckbox").checked = typeof data.enabled !== "undefined" ? !!data.enabled : true;
            document.getElementById("sponsorName").value = data.sponsor_name || "";
            infoFetched = true;
            lastFetchedDeviceInfo = data;
            showToast("Enhetsinfo hentet.");
        } else {
            showToast(data.error || "Feil", "error");
            resetFieldsToDefault();
        }
    } catch (e) {
        showToast("Feil: " + e.message, "error");
        resetFieldsToDefault();
    }
    disableButtons(["getDeviceInfoBtn", "createDeviceBtn"], false);
}

/**
 * Oppretter enhet basert på feltene i skjemaet og viser resultatmodal.
 * @param {Function} showToast - Funksjon for tilbakemelding.
 * @param {Function} showCreateDeviceModal - Funksjon for å vise modal ved suksess.
 * @param {Function} disableButtons - Funksjon for å deaktivere knapper.
 */
export async function createDevice(showToast, showCreateDeviceModal, disableButtons) {
    const mac = document.getElementById("macaddr").value.trim();
    const role_id = document.getElementById("roleDropdown").value;
    const enabled = document.getElementById("enabledCheckbox").checked;
    const visitor_name = document.getElementById("visitorName").value.trim();
    const expireInput = document.getElementById("expireTime").value;
    const sponsor_name = window.loggedInEmail || "";
    const sponsor_profile = "1";
    const expire_time = expireInput ? Math.floor(new Date(expireInput).getTime() / 1000) : 0;
    const payload = { mac, role_id, enabled, visitor_name, expire_time, sponsor_name, sponsor_profile };
    showToast("Sender...");
    disableButtons(["createDeviceBtn", "getDeviceInfoBtn"]);
    try {
        const response = await fetch("/create_device", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (response.ok) {
            showCreateDeviceModal(data);
            showToast("Enhet opprettet.");
            document.getElementById("sponsorName").value = sponsor_name;
            infoFetched = true;
        } else {
            showToast(data.error || "Feil", "error");
        }
    } catch (e) {
        showToast("Feil: " + e.message, "error");
    }
    disableButtons(["createDeviceBtn", "getDeviceInfoBtn"], false);
}

/**
 * Setter status for om enhetsinfo er hentet.
 * @param {boolean} val - Ny verdi for infoFetched.
 */
export function setInfoFetched(val) {
    infoFetched = val;
}
