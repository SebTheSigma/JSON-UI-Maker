import { ButtonOptions } from "../../elements/button.js";
import { GeneralUtil } from "../../util/generalUtil.js";
import { chooseImageModal } from "./chooseImage.js";

const modal: HTMLElement = document.getElementById("modalAddButton")!;
const closeBtn: HTMLElement = document.getElementById("modalAddButtonClose") as HTMLElement;

const options = [
    {
        type: "texture",
        default: "assets/placeholder",
        name: "defaultTexture",
        displayName: "Default Texture",
    },
    {
        type: "texture",
        default: "assets/placeholder",
        name: "hoverTexture",
        displayName: "Hover Texture",
    },
    {
        type: "texture",
        default: "assets/placeholder",
        name: "pressedTexture",
        displayName: "Pressed Texture",
    },
    {
        type: "number",
        default: "0",
        name: "collectionIndex",
        displayName: "Collection Index",
    },
];

export async function addButtonModal(): Promise<ButtonOptions> {
    modal.style.display = "block";

    const form: HTMLElement = document.getElementsByClassName("modalAddButtonForm")[0] as HTMLFormElement;

    // Clears the form
    form.innerHTML = "";

    const elements: HTMLInputElement[] = [];
    // Adds the options
    for (let option of options) {
        const input = document.createElement("input");
        input.autocomplete = "off";
        input.value = option.default!;

        if (option.type === "texture") {
            input.type = "text";
            input.readOnly = true;

            // Apply after added to DOM
            setTimeout(() => GeneralUtil.autoResizeInput(input));

            input.onclick = async function () {
                const filePath: string = await chooseImageModal();
                input.value = filePath;

                GeneralUtil.autoResizeInput(input);
            };
        }

        else {
            input.type = option.type;
        }

        
        input.name = option.name;
        input.className = "modalOptionInput";

        const label = document.createElement("label");
        label.textContent = `${option.displayName}: `;
        label.className = "modalOptionLabel";

        // Add the nodes
        form.appendChild(label);
        form.appendChild(input);
        form.appendChild(document.createElement("br"));

        elements.push(input);
    }

    // Make submit button
    const submit = document.createElement("input");
    submit.type = "submit";
    submit.value = "Create";
    submit.className = "modalSubmitButton";

    // Add submit button
    form.appendChild(submit);

    const fields: ButtonOptions = {};

    return new Promise((resolve: (textures: ButtonOptions) => void): void => {
        submit.onclick = () => {
            modal.style.display = "none";

            for (let element of elements) {
                console.log(element, element.value);
                fields[element.name] = element.value;
            }

            resolve(fields);
        };
    });
}

/**
 * Hides the add button modal
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
