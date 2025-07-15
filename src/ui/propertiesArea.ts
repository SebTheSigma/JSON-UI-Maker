import { DraggableButton } from "../elements/button.js";
import { DraggableCanvas } from "../elements/canvas.js";
import { DraggableLabel } from "../elements/label.js";
import { GLOBAL_ELEMENT_MAP, selectedElement } from "../index.js";
import { MathUtil } from "../util/mathUtil.js";

const propertiesMap = new Map([
    [
        "draggable-panel",
        [
            {
                type: "string",
                displayName: "Width",
                editable: true,

                get: (element: HTMLElement) => element.style.width,
                set: (element: HTMLElement, value: string) => (element.style.width = value),
            },
            {
                type: "string",
                displayName: "Height",
                editable: true,

                get: (element: HTMLElement) => element.style.height,
                set: (element: HTMLElement, value: string) => (element.style.height = value),
            },
            {
                type: "string",
                displayName: "Left",
                editable: true,

                get: (element: HTMLElement) => element.style.left,
                set: (element: HTMLElement, value: string) => (element.style.left = value),
            },
            {
                type: "string",
                displayName: "Top",
                editable: true,

                get: (element: HTMLElement) => element.style.top,
                set: (element: HTMLElement, value: string) => (element.style.top = value),
            },
            {
                type: "string",
                displayName: "Layer",
                editable: true,

                get: (element: HTMLElement) => element.style.zIndex,
                set: (element: HTMLElement, value: string) => (element.style.zIndex = value),
            },
        ],
    ],
    [
        "draggable-canvas",
        [
            {
                type: "string",
                displayName: "Width",
                editable: true,

                get: (element: HTMLElement) => element.style.width,
                set: (element: HTMLElement, value: string) => (element.style.width = value),
            },
            {
                type: "string",
                displayName: "Height",
                editable: true,

                get: (element: HTMLElement) => element.style.height,
                set: (element: HTMLElement, value: string) => (element.style.height = value),
            },
            {
                type: "string",
                displayName: "Left",
                editable: true,

                get: (element: HTMLElement) => element.style.left,
                set: (element: HTMLElement, value: string) => (element.style.left = value),
            },
            {
                type: "string",
                displayName: "Top",
                editable: true,

                get: (element: HTMLElement) => element.style.top,
                set: (element: HTMLElement, value: string) => (element.style.top = value),
            },
            {
                type: "string",
                displayName: "Layer",
                editable: true,

                get: (element: HTMLElement) => element.style.zIndex,
                set: (element: HTMLElement, value: string) => (element.style.zIndex = value),
            },
            {
                type: "text",
                displayName: "Texture",
                editable: true,

                get: (element: HTMLElement) => element.dataset.imageName,
                set: (element: HTMLElement, value: string) => {
                    const id = element.dataset.id!;
                    if (!id) return;

                    const elementClass = GLOBAL_ELEMENT_MAP.get(id)!;

                    if (elementClass instanceof DraggableCanvas) {
                        console.warn("Changing image");
                        elementClass.changeImage(value);
                    }
                },
            },
        ],
    ],
    [
        "draggable-button",
        [
            {
                type: "string",
                displayName: "Width",
                editable: true,

                get: (element: HTMLElement) => element.style.width,
                set: (element: HTMLElement, value: string) => (element.style.width = value),
            },
            {
                type: "string",
                displayName: "Height",
                editable: true,

                get: (element: HTMLElement) => element.style.height,
                set: (element: HTMLElement, value: string) => (element.style.height = value),
            },
            {
                type: "string",
                displayName: "Left",
                editable: true,

                get: (element: HTMLElement) => element.style.left,
                set: (element: HTMLElement, value: string) => (element.style.left = value),
            },
            {
                type: "string",
                displayName: "Top",
                editable: true,

                get: (element: HTMLElement) => element.style.top,
                set: (element: HTMLElement, value: string) => (element.style.top = value),
            },
            {
                type: "string",
                displayName: "Layer",
                editable: true,

                get: (element: HTMLElement) => element.style.zIndex,
                set: (element: HTMLElement, value: string) => (element.style.zIndex = value),
            },
            {
                type: "text",
                displayName: "Default Texture",
                editable: true,

                get: (element: HTMLElement) => element.dataset.defaultImageName,
                set: (element: HTMLElement, value: string) => {
                    const id = element.dataset.id!;
                    if (!id) return;

                    const elementClass = GLOBAL_ELEMENT_MAP.get(id)!;

                    if (elementClass instanceof DraggableButton) {
                        console.warn("Changing image");
                        elementClass.setDefaultImage(value);
                    }
                },
            },
            {
                type: "text",
                displayName: "Hover Texture",
                editable: true,

                get: (element: HTMLElement) => element.dataset.hoverImageName,
                set: (element: HTMLElement, value: string) => {
                    const id = element.dataset.id!;
                    if (!id) return;

                    const elementClass = GLOBAL_ELEMENT_MAP.get(id)!;

                    if (elementClass instanceof DraggableButton) {
                        console.warn("Changing image");
                        elementClass.setHoverImage(value);
                    }
                },
            },
            {
                type: "text",
                displayName: "Pressed Texture",
                editable: true,

                get: (element: HTMLElement) => element.dataset.pressedImageName,
                set: (element: HTMLElement, value: string) => {
                    const id = element.dataset.id!;
                    if (!id) return;

                    const elementClass = GLOBAL_ELEMENT_MAP.get(id)!;

                    if (elementClass instanceof DraggableButton) {
                        console.warn("Changing image");
                        elementClass.setPressedImage(value);
                    }
                },
            },
            {
                type: "number",
                displayName: "Collection Index",
                editable: true,

                get: (element: HTMLElement) => element.dataset.collectionIndex,
                set: (element: HTMLElement, value: string) => (element.dataset.collectionIndex = value),
            },
        ],
    ],
    [
        "draggable-collection_panel",
        [
            {
                type: "string",
                displayName: "Width",
                editable: true,

                get: (element: HTMLElement) => element.style.width,
                set: (element: HTMLElement, value: string) => (element.style.width = value),
            },
            {
                type: "string",
                displayName: "Height",
                editable: true,

                get: (element: HTMLElement) => element.style.height,
                set: (element: HTMLElement, value: string) => (element.style.height = value),
            },
            {
                type: "string",
                displayName: "Left",
                editable: true,

                get: (element: HTMLElement) => element.style.left,
                set: (element: HTMLElement, value: string) => (element.style.left = value),
            },
            {
                type: "string",
                displayName: "Top",
                editable: true,

                get: (element: HTMLElement) => element.style.top,
                set: (element: HTMLElement, value: string) => (element.style.top = value),
            },
            {
                type: "string",
                displayName: "Layer",
                editable: true,

                get: (element: HTMLElement) => element.style.zIndex,
                set: (element: HTMLElement, value: string) => (element.style.zIndex = value),
            },
            {
                type: "text",
                displayName: "Collection Name",
                editable: true,

                get: (element: HTMLElement) => element.dataset.collectionName,
                set: (element: HTMLElement, value: string) => (element.dataset.collectionName = value),
            },
        ],
    ],
    [
        "draggable-label",
        [
            {
                type: "string",
                displayName: "Width",
                editable: true,

                get: (element: HTMLElement) => element.style.width,
                set: (element: HTMLElement, value: string) => (element.style.width = value),
            },
            {
                type: "string",
                displayName: "Height",
                editable: true,

                get: (element: HTMLElement) => element.style.height,
                set: (element: HTMLElement, value: string) => (element.style.height = value),
            },
            {
                type: "string",
                displayName: "Left",
                editable: true,

                get: (element: HTMLElement) => element.style.left,
                set: (element: HTMLElement, value: string) => (element.style.left = value),
            },
            {
                type: "string",
                displayName: "Top",
                editable: true,

                get: (element: HTMLElement) => element.style.top,
                set: (element: HTMLElement, value: string) => (element.style.top = value),
            },
            {
                type: "string",
                displayName: "Layer",
                editable: true,

                get: (element: HTMLElement) => element.style.zIndex,
                set: (element: HTMLElement, value: string) => (element.style.zIndex = value),
            },
            {
                type: "number",
                displayName: "Font Scale",
                editable: true,

                get: (element: HTMLElement) => element.style.fontSize.replace("em", ""),
                set: (element: HTMLElement, value: string) => {
                    const id = element.dataset.id!;
                    if (!id) return;

                    const elementClass = GLOBAL_ELEMENT_MAP.get(id)!;

                    if (elementClass instanceof DraggableLabel) {
                        element.style.fontSize = `${value}em`;
                        elementClass.mirror.style.fontSize = `${value}em`;
                    }
                },
            },
            {
                type: "text",
                displayName: "Text Align",
                editable: true,

                get: (element: HTMLElement) => element.style.textAlign,
                set: (element: HTMLElement, value: string) => (element.style.textAlign = value),
            }
        ],
    ],
]);

let currentInputs: HTMLInputElement[] = [];

export function updatePropertiesArea(): void {
    console.log("Updating Properties Area");
    const propertiesArea = document.getElementById("properties")!;

    // Removes old event listeners
    for (let input of currentInputs) {
        input.oninput = null;
    }

    const properties = propertiesMap.get(selectedElement?.className!)!;

    // Clear the old inputs
    currentInputs = [];

    propertiesArea.innerHTML = "";

    if (!selectedElement) return;
    for (let property of properties) {
        const input = document.createElement("input");
        input.type = property.type;
        input.className = "propertyInput";

        const value = property.get(selectedElement!)!;
        input.value = value;

        const label = document.createElement("label");
        label.textContent = `${property.displayName}: `;

        const isEditableLabel = document.createElement("label");
        isEditableLabel.className = "isEditableLabel";
        isEditableLabel.textContent = `${property.editable ? "Editable" : "Not Editable"}`;

        if (property.editable) {
            input.contentEditable = "true";

            input.oninput = function () {
                property.set(selectedElement!, input.value);
            };
        } else input.contentEditable = "false";

        currentInputs.push(input);

        propertiesArea.appendChild(label);
        propertiesArea.appendChild(input);
        propertiesArea.appendChild(isEditableLabel);
        propertiesArea.appendChild(document.createElement("br"));
    }
}
