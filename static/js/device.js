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
        const response = await fetch("/GetDeviceRoles", {
            method: "GET",
            credentials: "include"
        });
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
        const response = await fetch(`/get_device_info?macaddr=${encodeURIComponent(macaddr)}`, { credentials: "include" });
        const data = await response.json();
        if (response.ok) {
            showDeviceInfoModal(data);
            const dropdown = document.getElementById("roleDropdown");
            // Fjern ALLTID tidligere "ukjent rolle" hvis den finnes
            Array.from(dropdown.querySelectorAll('option[data-unknown-role]')).forEach(opt => opt.remove());
            // Sjekk om rollen finnes i dropdown, hvis ikke legg til som valgt option (kun for visning)
            let found = false;
            for (let i = 0; i < dropdown.options.length; i++) {
                if (dropdown.options[i].value == (data.role_id || "")) {
                    found = true;
                    break;
                }
            }
            let isUnknownRole = false;
            if (!found && data.role_id && data.role_name) {
                const opt = document.createElement("option");
                opt.value = data.role_id;
                opt.textContent = data.role_name + " (ukjent/ikke tillatt)";
                opt.selected = true;
                opt.setAttribute('data-unknown-role', '1');
                opt.disabled = true;
                dropdown.appendChild(opt);
                dropdown.value = data.role_id;
                isUnknownRole = true;
            } else {
                dropdown.value = data.role_id || (dropdown.options.length > 0 ? dropdown.options[0].value : "");
            }
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
            // --- NY LOGIKK: Sett readonly hvis ukjent rolle eller feil sponsor ---
            const loggedInEmail = window.loggedInEmail || "";
            const isOtherSponsor = (data.sponsor_name && data.sponsor_name !== loggedInEmail);
            const readonly = isUnknownRole || isOtherSponsor;
            setDeviceFieldsReadonly(readonly);
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

// Hjelpefunksjon for å sette alle felter readonly og hindre Endre-modus
export function setDeviceFieldsReadonly(readonly) {
    document.getElementById("roleDropdown").disabled = readonly;
    document.getElementById("visitorName").readOnly = readonly;
    document.getElementById("expireTime").readOnly = readonly;
    document.getElementById("enabledCheckbox").disabled = readonly;
    // Hindrer Endre-modus ved input hvis readonly
    const actionFields = ["roleDropdown", "visitorName", "expireTime", "enabledCheckbox"];
    actionFields.forEach(id => {
        const el = document.getElementById(id);
        if (readonly) {
            el.classList.add("pointer-events-none", "opacity-60");
        } else {
            el.classList.remove("pointer-events-none", "opacity-60");
        }
    });
    // Hindre Endre-modus: fjern eventuelle edit-knapper hvis readonly
    if (readonly) {
        const actionDiv = document.getElementById("actionButtons");
        // Sett tilbake til standard knapper hvis de er i edit-modus
        if (document.getElementById("saveBtn") || document.getElementById("cancelBtn")) {
            actionDiv.innerHTML = `
                <button id="getDeviceInfoBtn" class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg">Hent info</button>
                <button id="createDeviceBtn" class="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg">Opprett enhet</button>
            `;
        }
    }
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
    if (!visitor_name || !mac) {
        showToast("Feltet 'Enhetsnavn' og 'MAC-adresse må fylles ut.", "error");
        return;
    }
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
            body: JSON.stringify(payload),
            credentials: "include"
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
 * Oppdaterer enhet basert på feltene i skjemaet og viser tilbakemelding.
 * @param {Function} showToast - Funksjon for tilbakemelding.
 * @param {Function} disableButtons - Funksjon for å deaktivere knapper.
 * @returns {Promise<object|null>} - Returnerer responsdata eller null ved feil.
 */
export async function updateDevice(showToast, disableButtons) {
    const dropdown = document.getElementById("roleDropdown");
    const selectedOpt = dropdown.options[dropdown.selectedIndex];
    const visitor_name = document.getElementById("visitorName").value.trim();
    if (!visitor_name) {
        showToast("Feltet 'Navn på enhet' må fylles ut.", "error");
        disableButtons(["saveFabBtn", "cancelFabBtn"], false);
        return null;
    }
    const mac = document.getElementById("macaddr").value.trim();
    const role_id = document.getElementById("roleDropdown").value;
    const enabled = document.getElementById("enabledCheckbox").checked;
    const expireInput = document.getElementById("expireTime").value;
    const sponsor_name = window.loggedInEmail || "";
    const sponsor_profile = "1";
    const expire_time = expireInput ? Math.floor(new Date(expireInput).getTime() / 1000) : 0;
    const payload = { mac, role_id, enabled, visitor_name, expire_time, sponsor_name, sponsor_profile };
    showToast("Lagrer endringer...");
    disableButtons(["saveFabBtn", "cancelFabBtn"]);
    try {
        const response = await fetch("/update_device", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            credentials: "include"
        });
        const data = await response.json();
        if (response.ok) {
            showToast("Endringer lagret.");
            return data;
        } else {
            showToast(data.error || "Feil", "error");
        }
    } catch (e) {
        showToast("Nettverksfeil", "error");
    }
    disableButtons(["saveFabBtn", "cancelFabBtn"], false);
    return null;
}

/**
 * Setter status for om enhetsinfo er hentet.
 * @param {boolean} val - Ny verdi for infoFetched.
 */
export function setInfoFetched(val) {
    infoFetched = val;
}
