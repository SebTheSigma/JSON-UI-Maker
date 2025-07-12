import { Builder } from "../../index.js";
import { config } from "../../CONFIG.js";
import { ButtonOptions } from "../../elements/button.js";

const modal: HTMLElement = document.getElementById("modalAddButton")!;
const closeBtn: HTMLElement = document.getElementById("modalAddButtonClose") as HTMLElement;

const options = [
    {
        type: "text",
        name: "defaultTexture",
        displayName: "Default Texture",
    },
    {
        type: "text",
        name: "hoverTexture",
        displayName: "Hover Texture",
    },
    {
        type: "text",
        name: "pressedTexture",
        displayName: "Pressed Texture",
    },
    {
        type: "number",
        name: "collectionIndex",
        displayName: "Collection Index",
    }
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
        input.type = option.type;
        input.name = option.name;
        input.style.maxWidth = "60px";

        const label = document.createElement("label");
        label.textContent = `${option.displayName}: `;

        // Add the nodes
        form.appendChild(label);
        form.appendChild(input);
        form.appendChild(document.createElement("br"));

        elements.push(input);
    }

    // Make submit button
    const submit = document.createElement("input");
    submit.type = "submit";
    submit.value = "Apply";

    // Add submit button
    form.appendChild(submit);

    const fields: ButtonOptions = {};

    return new Promise((resolve: (textures: ButtonOptions) => void): void => {
        submit.onclick = () => {
            console.log("Leaving Add Button Modal");
            modal.style.display = "none";

            for (let element of elements) {
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
