import { config } from "../../CONFIG.js";
import { loadPresetTextureSets } from "../../files/initDefaultImages.js";
const modal = document.getElementById("modalLoadTexturePresets");
const options = [
    {
        name: "turquoise_ore-ui_style",
        displayName: "Turquoise Ore-UI Style",
    },
    {
        name: "red_ore-ui_style",
        displayName: "Red Ore-UI Style",
    },
];
export async function loadTexturePresetsModal() {
    modal.style.display = "block";
    const form = document.getElementsByClassName("modalLoadTexturePresetsForm")[0];
    // Clears the form
    form.innerHTML = "";
    const bodyText = document.createElement("p");
    bodyText.innerHTML = "To get the textures in MC<br>download the files from github";
    bodyText.className = 'modalOptionInput';
    bodyText.style.textAlign = 'center';
    form.appendChild(bodyText);
    form.appendChild(document.createElement("br"));
    const elements = [];
    // Adds the options
    for (let option of options) {
        const input = document.createElement("input");
        input.type = 'checkbox';
        input.name = option.name;
        input.style.maxWidth = "100px";
        input.className = 'modalOptionInput';
        console.log(config.texturePresets);
        input.checked = config.texturePresets[option.name];
        if (input.checked === true) {
            input.disabled = true;
        }
        const label = document.createElement("label");
        label.textContent = `${option.displayName}: `;
        label.className = 'modalOptionLabel';
        // Add the nodes
        form.appendChild(label);
        form.appendChild(input);
        form.appendChild(document.createElement("br"));
        elements.push(input);
    }
    // Make submit button
    const submit = document.createElement("input");
    submit.type = "submit";
    submit.value = "Load Textures";
    submit.className = 'modalSubmitButton';
    // Add submit button
    form.appendChild(submit);
    new Promise(() => {
        submit.onclick = () => {
            for (let i = 0; i < elements.length; i++) {
                const element = elements[i];
                const checked = element.checked;
                console.log('value', checked);
                if (!checked)
                    continue;
                if (config.texturePresets[element.name] == true)
                    continue;
                loadPresetTextureSets(element.name);
                config.texturePresets[element.name] = true;
            }
            modal.style.display = "none";
        };
    });
}
//# sourceMappingURL=loadTexturePresets.js.map