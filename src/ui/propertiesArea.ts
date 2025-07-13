import { DraggableCanvas } from "../elements/canvas.js";
import { GLOBAL_ELEMENT_MAP, selectedElement } from "../index.js";


const properties = [
    {
        type: "string",
        displayName: "Width",
        
        get: (element: HTMLElement) => element.style.width,
        set: (element: HTMLElement, value: string) => element.style.width = value,
    },
    {
        type: "string",
        displayName: "Height",
        
        get: (element: HTMLElement) => element.style.height,
        set: (element: HTMLElement, value: string) => element.style.height = value,
    },
    {
        type: "string",
        displayName: "Left",

        get: (element: HTMLElement) => element.style.left,
        set: (element: HTMLElement, value: string) => element.style.left = value,
    },
    {
        type: "string",
        displayName: "Top",
        
        get: (element: HTMLElement) => element.style.top,
        set: (element: HTMLElement, value: string) => element.style.top = value,
    },
    {
        type: "string",
        displayName: "Layer",

        get: (element: HTMLElement) => element.style.zIndex,
        set: (element: HTMLElement, value: string) => element.style.zIndex = value,
    },
    {
        type: "text",
        displayName: "Default Texture",

        get: (element: HTMLElement) => element.dataset.defaultImageName,
        set: (element: HTMLElement, value: string) => element.dataset.defaultImageName = value,

        requires: (element: HTMLElement): boolean => element.classList.contains("draggable-button")
    },
    {
        type: "text",
        displayName: "Hover Texture",

        get: (element: HTMLElement) => element.dataset.hoverImageName,
        set: (element: HTMLElement, value: string) => element.dataset.hoverImageName = value,

        requires: (element: HTMLElement): boolean => element.classList.contains("draggable-button")
    },
    {
        type: "text",
        displayName: "Pressed Texture",

        get: (element: HTMLElement) => element.dataset.pressedImageName,
        set: (element: HTMLElement, value: string) => element.dataset.pressedImageName = value,

        requires: (element: HTMLElement): boolean => element.classList.contains("draggable-button")
    },
    {
        type: "number",
        displayName: "Collection Index",

        get: (element: HTMLElement) => element.dataset.collectionIndex,
        set: (element: HTMLElement, value: string) => element.dataset.collectionIndex = value,

        requires: (element: HTMLElement): boolean => element.classList.contains("draggable-button")
    },
    {
        type: "text",
        displayName: "Collection Name",

        get: (element: HTMLElement) => element.dataset.collectionName,
        set: (element: HTMLElement, value: string) => element.dataset.collectionName = value,

        requires: (element: HTMLElement): boolean => element.classList.contains("draggable-collection_panel")
    },
    {
        type: "text",
        displayName: "Texture",

        get: (element: HTMLElement) => element.dataset.imageName,
        set: (element: HTMLElement, value: string) => {
            const id = element.dataset.id!;
            if (!id) return;

            const elementClass = GLOBAL_ELEMENT_MAP.get(id)!;

            if (elementClass instanceof DraggableCanvas) {
                console.warn('Changing image')
                elementClass.changeImage(value);
            }
        },

        requires: (element: HTMLElement): boolean => element.classList.contains("draggable-canvas")
    }
]

let currentInputs: HTMLInputElement[] = [];

export function updatePropertiesArea(): void {
    const propertiesArea = document.getElementById("properties")!

    // Removes old event listeners
    for (let input of currentInputs) {
        input.oninput = null;
    }

    propertiesArea.innerHTML = "";

    for (let property of properties) {
        if (!selectedElement) continue;

        // Check if the property requires the selected element
        if (property.requires) {
            if (!property.requires(selectedElement!)) continue;
        }

        const input = document.createElement("input");
        input.type = property.type;

        const value = property.get(selectedElement!)!;
        input.value = value;

        const label = document.createElement("label")
        label.textContent = `${property.displayName}: `

        input.oninput = function () {
            property.set(selectedElement!, input.value);
        }

        currentInputs.push(input);

        propertiesArea.appendChild(label)
        propertiesArea.appendChild(input)
        propertiesArea.appendChild(document.createElement("br"));
    }
}