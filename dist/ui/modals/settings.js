import { Builder } from "../../index.js";
import { config } from "../../CONFIG.js";
const modal = document.getElementById("modalSettings");
const openBtn = document.getElementById("modalSettingsBtn");
const closeBtn = document.getElementById("modalSettingsClose");
/**
 * Shows the settings modal and selects the form within it.
 * @param {GlobalEventHandlersEvent} _event - Click event that triggered this function.
 */
openBtn.onclick = () => {
    modal.style.display = "block";
    const form = document.getElementsByClassName("modalSettingsForm")[0];
    // Clears the form
    form.innerHTML = "";
    // Adds the settings
    for (let setting in config.settings) {
        // Input
        const input = document.createElement("input");
        const settingInfo = config.settings[setting];
        if (!settingInfo?.editable)
            continue;
        input.type = settingInfo?.type;
        input.name = setting;
        input.id = setting;
        input.style.outline = "none";
        input.style.width = "60px";
        input.style.height = "15px";
        input.style.position = "relative";
        input.className = "modalOptionInput";
        input.value = settingInfo?.value;
        if (settingInfo?.type === "checkbox") {
            input.checked = settingInfo?.value;
            input.style.top = "2px";
            input.oninput = (e) => {
                Builder.setSettingToggle(setting, e.target.checked);
                settingInfo.onchange?.(settingInfo?.value);
            };
        }
        else if (settingInfo?.type === "number") {
            input.valueAsNumber = settingInfo?.value;
            input.oninput = (e) => {
                Builder.setSettingToggle(setting, e.target.valueAsNumber);
                settingInfo.onchange?.(settingInfo?.value);
            };
        }
        else {
            settingInfo.onchange?.(settingInfo?.value);
        }
        // Label
        const label = document.createElement("label");
        label.className = "modalOptionLabel";
        label.innerText = `${settingInfo?.displayName}: `;
        label.htmlFor = setting;
        // Adds the elements
        form.appendChild(label);
        form.appendChild(input);
        form.appendChild(document.createElement("br"));
    }
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
window.addEventListener("click", (event) => {
    if (event.target == modal) {
        modal.style.display = "none";
    }
});
//# sourceMappingURL=settings.js.map