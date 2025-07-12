import { Builder } from "../../index.js";
import { config } from "../../CONFIG.js";

const modal: HTMLElement = document.getElementById("modalSettings")!;
const openBtn: HTMLElement = document.getElementById("modalSettingsBtn")!;
const closeBtn: HTMLElement = document.getElementById("modalSettingsClose") as HTMLElement;





/**
 * Shows the settings modal and selects the form within it.
 * @param {GlobalEventHandlersEvent} _event - Click event that triggered this function.
 */
openBtn.onclick = () => {
    modal.style.display = "block";

    const form: HTMLElement = document.getElementsByClassName("modalSettingsForm")[0] as HTMLFormElement;

    // Clears the form
    form.innerHTML = "";

    // Adds the settings
    for (let setting in config.settings) {

        // Input
        const input = document.createElement("input");
        const settingInfo = config.settings[setting];
        if (!settingInfo?.editable) continue;

        input.type = settingInfo?.type!;
        input.name = setting;
        input.id = setting;
        input.style.maxWidth = '60px';

        input.value = settingInfo?.value!;

        if (settingInfo?.type === "checkbox") {
            input.checked = settingInfo?.value!;
            input.oninput = (e: Event) => {
                Builder.setSettingToggle(setting as keyof typeof config.settings, (e.target as HTMLInputElement).checked);
            }
        }

        else if (settingInfo?.type === "number") {
            input.valueAsNumber = settingInfo?.value!;
            input.oninput = (e: Event) => {
                Builder.setSettingToggle(setting as keyof typeof config.settings, (e.target as HTMLInputElement).valueAsNumber);
            }
        }
        

        // Label
        const label = document.createElement("label");
        label.innerText = `${settingInfo?.displayName!}: `;
        label.htmlFor = setting;

        // Adds the elements
        form.appendChild(label);
        form.appendChild(input);
        form.appendChild(document.createElement("br"));
    }

    // Make submit button
    const submit = document.createElement("input");
    submit.type = "submit";
    submit.value = "Close";

    submit.onclick = () => {
        modal.style.display = "none";
    }

    // Add submit button
    form.appendChild(submit);
};

/**
 * Hides the settings modal
 */
closeBtn.onclick = () => {
    modal.style.display = "none";
};


/**
 * Closes the settings modal when the user clicks outside of it.
 * If the click event's target is the modal itself (indicating a click
 */
window.onclick = (event) => {
    if (event.target == modal) {
        modal.style.display = "none";
    }
};
