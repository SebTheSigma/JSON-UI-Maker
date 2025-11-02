import { images } from "../../index.js";
const modal = document.getElementById("modalAddButton");
const closeBtn = document.getElementById("modalAddButtonClose");
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
export async function addButtonModal() {
    modal.style.display = "block";
    const form = document.getElementsByClassName("modalAddButtonForm")[0];
    // Clears the form
    form.innerHTML = "";
    const elements = [];
    // Adds the options
    for (let option of options) {
        const input = document.createElement("input");
        input.type = option.type;
        input.name = option.name;
        input.style.maxWidth = "60px";
        input.className = 'modalOptionInput';
        if (/texture/i.test(option.displayName)) {
            input.onfocus = function () { attachTextureSearch(input); };
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
    submit.value = "Create";
    submit.className = 'modalSubmitButton';
    // Add submit button
    form.appendChild(submit);
    const fields = {};
    return new Promise((resolve) => {
        submit.onclick = () => {
            modal.style.display = "none";
            for (let element of elements) {
                fields[element.name] = element.value;
            }
            resolve(fields);
        };
    });
}
function attachTextureSearch(input) {
    try {
        const dropdown = document.createElement("div");
        dropdown.className = "textureSearchDropdown";
        dropdown.tabIndex = -1;
        const position = () => {
            const rect = input.getBoundingClientRect();
            dropdown.style.position = "absolute";
            dropdown.style.left = `${rect.left + window.scrollX}px`;
            dropdown.style.top = `${rect.bottom + window.scrollY}px`;
            dropdown.style.minWidth = `${rect.width}px`;
            dropdown.style.maxWidth = `${rect.width}px`;
        };
        const render = (q) => {
            dropdown.innerHTML = "";
            const query = (q || "").toLowerCase();
            for (const [name] of images.entries()) {
                if (!query || name.toLowerCase().includes(query)) {
                    const item = document.createElement("div");
                    item.className = "textureSearchItem";
                    item.textContent = name;
                    item.onclick = () => {
                        input.value = name;
                        input.dispatchEvent(new Event("input"));
                        cleanup();
                    };
                    dropdown.appendChild(item);
                }
            }
            if (!dropdown.childElementCount) {
                const none = document.createElement("div");
                none.className = "textureSearchItem";
                none.textContent = "No matches";
                none.style.color = "#bbb";
                dropdown.appendChild(none);
            }
        };
        const onInput = () => render(input.value);
        const cleanup = () => {
            if (document.body.contains(dropdown)) {
                document.body.removeChild(dropdown);
            }
            input.removeEventListener("input", onInput);
            window.removeEventListener("scroll", position);
            window.removeEventListener("resize", position);
        };
        render(input.value);
        position();
        document.body.appendChild(dropdown);
        input.addEventListener("input", onInput);
        window.addEventListener("scroll", position);
        window.addEventListener("resize", position);
        const blurHandler = () => {
            setTimeout(() => cleanup(), 200);
        };
        input.addEventListener("blur", blurHandler, { once: true });
    }
    catch (err) {
        console.error("Failed to attach texture search", err);
    }
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
//# sourceMappingURL=addButton.js.map
