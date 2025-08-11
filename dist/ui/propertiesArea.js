import { config } from "../CONFIG.js";
import { DraggableButton } from "../elements/button.js";
import { DraggableCanvas } from "../elements/canvas.js";
import { DraggableLabel } from "../elements/label.js";
import { GLOBAL_ELEMENT_MAP, selectedElement } from "../index.js";
import { GeneralUtil } from "../util/generalUtil.js";
import { StringUtil } from "../util/stringUtil.js";
export const propertiesMap = new Map([
    [
        "draggable-panel",
        [
            {
                type: "string",
                displayName: "Width",
                editable: true,
                get: (element) => element.style.width,
                set: (element, value) => (element.style.width = value),
            },
            {
                type: "string",
                displayName: "Height",
                editable: true,
                get: (element) => element.style.height,
                set: (element, value) => (element.style.height = value),
            },
            {
                type: "string",
                displayName: "Left",
                editable: true,
                get: (element) => element.style.left,
                set: (element, value) => (element.style.left = value),
            },
            {
                type: "string",
                displayName: "Top",
                editable: true,
                get: (element) => element.style.top,
                set: (element, value) => (element.style.top = value),
            },
            {
                type: "string",
                displayName: "Layer",
                editable: true,
                get: (element) => element.style.zIndex,
                set: (element, value) => (element.style.zIndex = value),
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
                get: (element) => element.style.width,
                set: (element, value) => (element.style.width = value),
            },
            {
                type: "string",
                displayName: "Height",
                editable: true,
                get: (element) => element.style.height,
                set: (element, value) => (element.style.height = value),
            },
            {
                type: "string",
                displayName: "Left",
                editable: true,
                get: (element) => element.style.left,
                set: (element, value) => (element.style.left = value),
            },
            {
                type: "string",
                displayName: "Top",
                editable: true,
                get: (element) => element.style.top,
                set: (element, value) => (element.style.top = value),
            },
            {
                type: "string",
                displayName: "Layer",
                editable: true,
                get: (element) => element.style.zIndex,
                set: (element, value) => (element.style.zIndex = value),
            },
            {
                type: "text",
                displayName: "Texture",
                editable: true,
                get: (element) => element.dataset.imageName,
                set: (element, value) => {
                    const elementClass = GeneralUtil.elementToClassElement(element);
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
                get: (element) => element.style.width,
                set: (element, value) => {
                    const elementClass = GeneralUtil.elementToClassElement(element);
                    if (elementClass instanceof DraggableButton) {
                        elementClass.drawImage(parseFloat(value), elementClass.canvas.height);
                    }
                },
            },
            {
                type: "string",
                displayName: "Height",
                editable: true,
                get: (element) => element.style.height,
                set: (element, value) => {
                    const elementClass = GeneralUtil.elementToClassElement(element);
                    if (elementClass instanceof DraggableButton) {
                        elementClass.drawImage(elementClass.canvas.width, parseFloat(value));
                    }
                },
            },
            {
                type: "string",
                displayName: "Left",
                editable: true,
                get: (element) => element.style.left,
                set: (element, value) => (element.style.left = value),
            },
            {
                type: "string",
                displayName: "Top",
                editable: true,
                get: (element) => element.style.top,
                set: (element, value) => (element.style.top = value),
            },
            {
                type: "string",
                displayName: "Layer",
                editable: true,
                get: (element) => element.style.zIndex,
                set: (element, value) => (element.style.zIndex = value),
            },
            {
                type: "text",
                displayName: "Default Texture",
                editable: true,
                get: (element) => element.dataset.defaultImageName,
                set: (element, value) => {
                    const elementClass = GeneralUtil.elementToClassElement(element);
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
                get: (element) => element.dataset.hoverImageName,
                set: (element, value) => {
                    const id = element.dataset.id;
                    if (!id)
                        return;
                    const elementClass = GLOBAL_ELEMENT_MAP.get(id);
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
                get: (element) => element.dataset.pressedImageName,
                set: (element, value) => {
                    const id = element.dataset.id;
                    if (!id)
                        return;
                    const elementClass = GLOBAL_ELEMENT_MAP.get(id);
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
                get: (element) => element.dataset.collectionIndex,
                set: (element, value) => (element.dataset.collectionIndex = value),
            },
            {
                type: "text",
                displayName: "Display Texture",
                editable: true,
                get: (element) => element.dataset.displayImageName,
                set: (element, value) => {
                    const id = element.dataset.id;
                    if (!id)
                        return;
                    const elementClass = GLOBAL_ELEMENT_MAP.get(id);
                    if (elementClass instanceof DraggableButton) {
                        console.warn("Changing display image");
                        elementClass.setDisplayImage(value);
                    }
                },
            }
        ],
    ],
    [
        "draggable-collection_panel",
        [
            {
                type: "string",
                displayName: "Width",
                editable: true,
                get: (element) => element.style.width,
                set: (element, value) => (element.style.width = value),
            },
            {
                type: "string",
                displayName: "Height",
                editable: true,
                get: (element) => element.style.height,
                set: (element, value) => (element.style.height = value),
            },
            {
                type: "string",
                displayName: "Left",
                editable: true,
                get: (element) => element.style.left,
                set: (element, value) => (element.style.left = value),
            },
            {
                type: "string",
                displayName: "Top",
                editable: true,
                get: (element) => element.style.top,
                set: (element, value) => (element.style.top = value),
            },
            {
                type: "string",
                displayName: "Layer",
                editable: true,
                get: (element) => element.style.zIndex,
                set: (element, value) => (element.style.zIndex = value),
            },
            {
                type: "text",
                displayName: "Collection Name",
                editable: true,
                get: (element) => element.dataset.collectionName,
                set: (element, value) => (element.dataset.collectionName = value),
            },
        ],
    ],
    [
        "draggable-label",
        [
            {
                type: "string",
                displayName: "Left",
                editable: true,
                get: (element) => element.style.left,
                set: (element, value) => {
                    element.style.left = value;
                    const elementClass = GeneralUtil.elementToClassElement(element);
                    if (elementClass instanceof DraggableLabel) {
                        const offset = config.magicNumbers.labelToOffset(elementClass.label);
                        elementClass.shadowLabel.style.left = `${StringUtil.cssDimToNumber(elementClass.label.style.left) + elementClass.shadowOffsetX + offset[0]}px`;
                    }
                },
            },
            {
                type: "string",
                displayName: "Top",
                editable: true,
                get: (element) => element.style.top,
                set: (element, value) => {
                    element.style.top = value;
                    const elementClass = GeneralUtil.elementToClassElement(element);
                    if (elementClass instanceof DraggableLabel) {
                        const offset = config.magicNumbers.labelToOffset(elementClass.label);
                        elementClass.shadowLabel.style.top = `${StringUtil.cssDimToNumber(elementClass.label.style.top) + elementClass.shadowOffsetY + offset[1]}px`;
                    }
                },
            },
            {
                type: "string",
                displayName: "Layer",
                editable: true,
                get: (element) => element.style.zIndex,
                set: (element, value) => {
                    element.style.zIndex = value;
                    const elementClass = GeneralUtil.elementToClassElement(element);
                    if (elementClass instanceof DraggableLabel) {
                        elementClass.shadowLabel.style.zIndex = value;
                    }
                },
            },
            {
                type: "number",
                displayName: "Font Scale",
                editable: true,
                get: (element) => element.style.fontSize.replace("em", ""),
                set: (element, value) => {
                    const elementClass = GeneralUtil.elementToClassElement(element);
                    if (elementClass instanceof DraggableLabel) {
                        element.style.fontSize = `${value}em`;
                        elementClass.mirror.style.fontSize = `${value}em`;
                        elementClass.shadowLabel.style.fontSize = `${value}em`;
                        elementClass.updateSize();
                    }
                },
            },
            {
                type: "text",
                displayName: "Text Align",
                editable: true,
                get: (element) => element.style.textAlign,
                set: (element, value) => {
                    const elementClass = GeneralUtil.elementToClassElement(element);
                    if (elementClass instanceof DraggableLabel) {
                        elementClass.shadowLabel.style.textAlign = value;
                        elementClass.label.style.textAlign = value;
                        elementClass.mirror.style.textAlign = value;
                        elementClass.updateSize(false);
                    }
                },
            },
            {
                type: "text",
                displayName: "Font Family",
                editable: true,
                get: (element) => element.style.fontFamily,
                set: (element, value) => {
                    const elementClass = GeneralUtil.elementToClassElement(element);
                    if (elementClass instanceof DraggableLabel) {
                        elementClass.shadowLabel.style.fontFamily = value;
                        elementClass.mirror.style.fontFamily = value;
                        elementClass.label.style.fontFamily = value;
                        elementClass.updateSize();
                    }
                },
            },
            {
                type: "checkbox",
                displayName: "Shadow",
                editable: true,
                get: (element) => {
                    const elementClass = GeneralUtil.elementToClassElement(element);
                    if (elementClass instanceof DraggableLabel) {
                        return elementClass.hasShadow;
                    }
                    return false;
                },
                set: (element) => {
                    const elementClass = GeneralUtil.elementToClassElement(element);
                    if (elementClass instanceof DraggableLabel) {
                        return elementClass.shadow(!elementClass.hasShadow);
                    }
                    return false;
                },
            }
        ],
    ],
    [
        "draggable-scrolling_panel",
        [
            {
                type: "string",
                displayName: "Width",
                editable: true,
                get: (element) => element.style.width,
                set: (element, value) => (element.style.width = value),
            },
            {
                type: "string",
                displayName: "Height",
                editable: true,
                get: (element) => element.style.height,
                set: (element, value) => (element.style.height = value),
            },
            {
                type: "string",
                displayName: "Left",
                editable: true,
                get: (element) => element.style.left,
                set: (element, value) => (element.style.left = value),
            },
            {
                type: "string",
                displayName: "Top",
                editable: true,
                get: (element) => element.style.top,
                set: (element, value) => (element.style.top = value),
            },
            {
                type: "string",
                displayName: "Layer",
                editable: true,
                get: (element) => element.style.zIndex,
                set: (element, value) => (element.style.zIndex = value),
            },
        ],
    ],
]);
let currentInputs = [];
export function updatePropertiesArea() {
    const propertiesArea = document.getElementById("properties");
    // Removes old event listeners
    for (let input of currentInputs) {
        input.oninput = null;
    }
    const properties = propertiesMap.get(selectedElement?.className);
    // Clear the old inputs
    currentInputs = [];
    propertiesArea.innerHTML = "";
    if (!selectedElement)
        return;
    for (let property of properties) {
        const input = document.createElement("input");
        input.type = property.type;
        input.className = "propertyInput";
        const value = property.get(selectedElement);
        // Different input types
        if (property.type === "checkbox")
            input.checked = value;
        else
            input.value = value;
        const label = document.createElement("label");
        label.textContent = `${property.displayName}: `;
        const isEditableLabel = document.createElement("label");
        isEditableLabel.className = "isEditableLabel";
        isEditableLabel.textContent = `${property.editable ? "Editable" : "Not Editable"}`;
        if (property.editable) {
            input.contentEditable = "true";
            input.oninput = function () {
                property.set(selectedElement, input.value);
            };
        }
        else
            input.contentEditable = "false";
        currentInputs.push(input);
        propertiesArea.appendChild(label);
        propertiesArea.appendChild(input);
        propertiesArea.appendChild(isEditableLabel);
        propertiesArea.appendChild(document.createElement("br"));
    }
}
//# sourceMappingURL=propertiesArea.js.map