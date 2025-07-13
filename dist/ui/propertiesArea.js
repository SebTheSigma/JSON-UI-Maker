import { DraggableCanvas } from "../elements/canvas.js";
import { GLOBAL_ELEMENT_MAP, selectedElement } from "../index.js";
const properties = [
    {
        type: "string",
        displayName: "Width",
        get: (element) => element.style.width,
        set: (element, value) => element.style.width = value,
    },
    {
        type: "string",
        displayName: "Height",
        get: (element) => element.style.height,
        set: (element, value) => element.style.height = value,
    },
    {
        type: "string",
        displayName: "Left",
        get: (element) => element.style.left,
        set: (element, value) => element.style.left = value,
    },
    {
        type: "string",
        displayName: "Top",
        get: (element) => element.style.top,
        set: (element, value) => element.style.top = value,
    },
    {
        type: "string",
        displayName: "Layer",
        get: (element) => element.style.zIndex,
        set: (element, value) => element.style.zIndex = value,
    },
    {
        type: "text",
        displayName: "Default Texture",
        get: (element) => element.dataset.defaultImageName,
        set: (element, value) => element.dataset.defaultImageName = value,
        requires: (element) => element.classList.contains("draggable-button")
    },
    {
        type: "text",
        displayName: "Hover Texture",
        get: (element) => element.dataset.hoverImageName,
        set: (element, value) => element.dataset.hoverImageName = value,
        requires: (element) => element.classList.contains("draggable-button")
    },
    {
        type: "text",
        displayName: "Pressed Texture",
        get: (element) => element.dataset.pressedImageName,
        set: (element, value) => element.dataset.pressedImageName = value,
        requires: (element) => element.classList.contains("draggable-button")
    },
    {
        type: "number",
        displayName: "Collection Index",
        get: (element) => element.dataset.collectionIndex,
        set: (element, value) => element.dataset.collectionIndex = value,
        requires: (element) => element.classList.contains("draggable-button")
    },
    {
        type: "text",
        displayName: "Collection Name",
        get: (element) => element.dataset.collectionName,
        set: (element, value) => element.dataset.collectionName = value,
        requires: (element) => element.classList.contains("draggable-collection_panel")
    },
    {
        type: "text",
        displayName: "Texture",
        get: (element) => element.dataset.imageName,
        set: (element, value) => {
            const id = element.dataset.id;
            if (!id)
                return;
            const elementClass = GLOBAL_ELEMENT_MAP.get(id);
            if (elementClass instanceof DraggableCanvas) {
                console.warn('Changing image');
                elementClass.changeImage(value);
            }
        },
        requires: (element) => element.classList.contains("draggable-canvas")
    }
];
let currentInputs = [];
export function updatePropertiesArea() {
    const propertiesArea = document.getElementById("properties");
    // Removes old event listeners
    for (let input of currentInputs) {
        input.oninput = null;
    }
    propertiesArea.innerHTML = "";
    for (let property of properties) {
        if (!selectedElement)
            continue;
        // Check if the property requires the selected element
        if (property.requires) {
            if (!property.requires(selectedElement))
                continue;
        }
        const input = document.createElement("input");
        input.type = property.type;
        const value = property.get(selectedElement);
        input.value = value;
        const label = document.createElement("label");
        label.textContent = `${property.displayName}: `;
        input.oninput = function () {
            property.set(selectedElement, input.value);
        };
        currentInputs.push(input);
        propertiesArea.appendChild(label);
        propertiesArea.appendChild(input);
        propertiesArea.appendChild(document.createElement("br"));
    }
}
//# sourceMappingURL=propertiesArea.js.map