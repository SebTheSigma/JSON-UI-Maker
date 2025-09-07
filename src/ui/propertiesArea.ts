import { config } from "../CONFIG.js";
import { DraggableButton } from "../elements/button.js";
import { DraggableCanvas } from "../elements/canvas.js";
import { DraggableCollectionPanel } from "../elements/collectionPanel.js";
import { DraggableLabel } from "../elements/label.js";
import { DraggablePanel } from "../elements/panel.js";
import { DraggableScrollingPanel } from "../elements/scrollingPanel.js";
import { ElementSharedFuncs } from "../elements/sharedElement.js";
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

                get: (element: HTMLElement) => element.style.width,
                set: (element: HTMLElement, value: string) => {
                    element.style.width = value;
                    ElementSharedFuncs.updateCenterCirclePosition(GeneralUtil.elementToClassElement(element) as DraggablePanel);
                },
            },
            {
                type: "string",
                displayName: "Height",
                editable: true,

                get: (element: HTMLElement) => element.style.height,
                set: (element: HTMLElement, value: string) => {
                    element.style.height = value;
                    ElementSharedFuncs.updateCenterCirclePosition(GeneralUtil.elementToClassElement(element) as DraggablePanel);
                },
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
                type: "button",
                displayName: "Fill Parent",
                editable: true,

                set: (element: HTMLElement, value: string) => {
                    const parent = element.parentElement!;
                    element.style.width = parent.style.width;
                    element.style.height = parent.style.height;
                    element.style.left = '0px';
                    element.style.top = '0px';
                    ElementSharedFuncs.updateCenterCirclePosition(GeneralUtil.elementToClassElement(element) as DraggablePanel);
                },
            }
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
                set: (element: HTMLElement, value: string) => {
                    const classElement = GeneralUtil.elementToClassElement(element) as DraggableCanvas;
                    const numVal: number = StringUtil.cssDimToNumber(value);
                    const height: number = StringUtil.cssDimToNumber(classElement.canvas.style.height);

                    if (classElement.nineSlice) {
                        classElement.drawImage(numVal, height);
                    } else {
                        classElement.drawImage(numVal, numVal / classElement.aspectRatio);
                    }

                    ElementSharedFuncs.updateCenterCirclePosition(classElement);
                },
            },
            {
                type: "string",
                displayName: "Height",
                editable: true,

                get: (element: HTMLElement) => element.style.height,
                set: (element: HTMLElement, value: string) => {
                    const classElement = GeneralUtil.elementToClassElement(element) as DraggableCanvas;
                    const numVal: number = StringUtil.cssDimToNumber(value);
                    const width: number = StringUtil.cssDimToNumber(classElement.canvas.style.width);

                    if (classElement.nineSlice) {
                        classElement.drawImage(width, numVal);
                    } else {
                        classElement.drawImage(numVal * classElement.aspectRatio, numVal);
                    }

                    ElementSharedFuncs.updateCenterCirclePosition(classElement);
                },
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
                    const elementClass = GeneralUtil.elementToClassElement(element) as DraggableCanvas;

                    elementClass.changeImage(value);
                },
            },
            {
                type: "button",
                displayName: "Fill Parent",
                editable: true,

                set: (element: HTMLElement, value: string) => {
                    const parent = element.parentElement!;
                    const classElement = GeneralUtil.elementToClassElement(element) as DraggableCanvas;

                    const height: number = StringUtil.cssDimToNumber(parent.style.height);
                    const width: number = StringUtil.cssDimToNumber(parent.style.width);

                    const adjustedWidth: number = width / classElement.aspectRatio;
                    const adjustedHeight: number = height * classElement.aspectRatio;

                    if (classElement.nineSlice) {
                        classElement.drawImage(width, height);
                    } else {

                        if (adjustedHeight > width) {

                            console.log(width, adjustedWidth, 1);
                            classElement.drawImage(width, adjustedWidth);
                        }

                        else {

                            console.log(adjustedHeight, height, 2);
                            classElement.drawImage(adjustedHeight, height);
                        }
                    }
                    
                    element.style.left = '0px';
                    element.style.top = '0px';
                    ElementSharedFuncs.updateCenterCirclePosition(classElement);
                },
            }
        ],
    ],
    [
        "draggable-button",
        [
            {
                type: "text",
                displayName: "Width",
                editable: true,

                get: (element: HTMLElement) => element.style.width,
                set: (element: HTMLElement, value: string) => {
                    const elementClass = GeneralUtil.elementToClassElement(element) as DraggableButton;

                    elementClass.drawImage(parseFloat(value), elementClass.canvas.height);
                    ElementSharedFuncs.updateCenterCirclePosition(elementClass);
                },
            },
            {
                type: "text",
                displayName: "Height",
                editable: true,

                get: (element: HTMLElement) => element.style.height,
                set: (element: HTMLElement, value: string) => {
                    const elementClass = GeneralUtil.elementToClassElement(element) as DraggableButton;

                    elementClass.drawImage(elementClass.canvas.width, parseFloat(value));
                    ElementSharedFuncs.updateCenterCirclePosition(elementClass);
                },
            },
            {
                type: "text",
                displayName: "Left",
                editable: true,

                get: (element: HTMLElement) => element.style.left,
                set: (element: HTMLElement, value: string) => (element.style.left = value),
            },
            {
                type: "text",
                displayName: "Top",
                editable: true,

                get: (element: HTMLElement) => element.style.top,
                set: (element: HTMLElement, value: string) => (element.style.top = value),
            },
            {
                type: "text",
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
                    const elementClass = GeneralUtil.elementToClassElement(element) as DraggableButton;

                    elementClass.setDefaultImage(value);
                },
            },
            {
                type: "text",
                displayName: "Hover Texture",
                editable: true,

                get: (element: HTMLElement) => element.dataset.hoverImageName,
                set: (element: HTMLElement, value: string) => {
                    const elementClass = GeneralUtil.elementToClassElement(element) as DraggableButton;

                    elementClass.setHoverImage(value);
                },
            },
            {
                type: "text",
                displayName: "Pressed Texture",
                editable: true,

                get: (element: HTMLElement) => element.dataset.pressedImageName,
                set: (element: HTMLElement, value: string) => {
                    const elementClass = GeneralUtil.elementToClassElement(element) as DraggableButton;

                    elementClass.setPressedImage(value);
                },
            },
            {
                type: "number",
                displayName: "Collection Index",
                editable: true,

                get: (element: HTMLElement) => element.dataset.collectionIndex,
                set: (element: HTMLElement, value: string) => (element.dataset.collectionIndex = value),
            },
            {
                type: "text",
                displayName: "Display Texture",
                editable: true,

                get: (element: HTMLElement) => element.dataset.displayImageName,
                set: (element: HTMLElement, value: string) => {
                    const elementClass = GeneralUtil.elementToClassElement(element) as DraggableButton;

                    elementClass.setDisplayImage(value);
                },
            },
            {
                type: "button",
                displayName: "Fill Parent",
                editable: true,

                set: (element: HTMLElement, value: string) => {
                    const parent = element.parentElement!;
                    const classElement = GeneralUtil.elementToClassElement(element) as DraggableButton;

                    const height: number = StringUtil.cssDimToNumber(parent.style.height);
                    const width: number = StringUtil.cssDimToNumber(parent.style.width);

                    const adjustedWidth: number = width * classElement.aspectRatio;
                    const adjustedHeight: number = height * classElement.aspectRatio;

                    if (classElement.getCurrentlyRenderedState().json) {
                        classElement.drawImage(width, height);
                    } else {

                        if (adjustedHeight > width) {

                            console.log(width, adjustedWidth, 1);
                            classElement.drawImage(width, adjustedWidth);
                        }

                        else {

                            console.log(adjustedHeight, height, 2);
                            classElement.drawImage(adjustedHeight, height);
                        }
                    }
                    
                    element.style.left = '0px';
                    element.style.top = '0px';
                    ElementSharedFuncs.updateCenterCirclePosition(classElement);
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

                get: (element: HTMLElement) => element.style.width,
                set: (element: HTMLElement, value: string) => {
                    element.style.width = value;
                    ElementSharedFuncs.updateCenterCirclePosition(GeneralUtil.elementToClassElement(element) as DraggableCollectionPanel);
                },
            },
            {
                type: "string",
                displayName: "Height",
                editable: true,

                get: (element: HTMLElement) => element.style.height,
                set: (element: HTMLElement, value: string) => {
                    element.style.height = value;
                    ElementSharedFuncs.updateCenterCirclePosition(GeneralUtil.elementToClassElement(element) as DraggableCollectionPanel);
                },
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
                displayName: "Left",
                editable: true,

                get: (element: HTMLElement) => element.style.left,
                set: (element: HTMLElement, value: string) => {
                    element.style.left = value;
                    const elementClass = GeneralUtil.elementToClassElement(element) as DraggableLabel;

                    const offset = config.magicNumbers.labelToOffset(elementClass.label);
                    elementClass.shadowLabel.style.left = `${
                        StringUtil.cssDimToNumber(elementClass.label.style.left) + elementClass.shadowOffsetX + offset[0]
                    }px`;
                },
            },
            {
                type: "string",
                displayName: "Top",
                editable: true,

                get: (element: HTMLElement) => element.style.top,
                set: (element: HTMLElement, value: string) => {
                    element.style.top = value;
                    const elementClass = GeneralUtil.elementToClassElement(element) as DraggableLabel;

                    const offset = config.magicNumbers.labelToOffset(elementClass.label);
                    elementClass.shadowLabel.style.top = `${
                        StringUtil.cssDimToNumber(elementClass.label.style.top) + elementClass.shadowOffsetY + offset[1]
                    }px`;
                },
            },
            {
                type: "string",
                displayName: "Layer",
                editable: true,

                get: (element: HTMLElement) => element.style.zIndex,
                set: (element: HTMLElement, value: string) => {
                    element.style.zIndex = value;
                    const elementClass = GeneralUtil.elementToClassElement(element) as DraggableLabel;

                    elementClass.shadowLabel.style.zIndex = value;
                },
            },
            {
                type: "number",
                displayName: "Font Scale",
                editable: true,

                get: (element: HTMLElement) => element.style.fontSize.replace("em", ""),
                set: (element: HTMLElement, value: string) => {
                    const elementClass = GeneralUtil.elementToClassElement(element) as DraggableLabel;

                    element.style.fontSize = `${value}em`;
                    elementClass.mirror.style.fontSize = `${value}em`;
                    elementClass.shadowLabel.style.fontSize = `${value}em`;
                    elementClass.updateSize();
                },
            },
            {
                type: "text",
                displayName: "Text Align",
                editable: true,

                get: (element: HTMLElement) => element.style.textAlign,
                set: (element: HTMLElement, value: string) => {
                    const elementClass = GeneralUtil.elementToClassElement(element) as DraggableLabel;

                    elementClass.shadowLabel.style.textAlign = value;
                    elementClass.label.style.textAlign = value;
                    elementClass.mirror.style.textAlign = value;
                    elementClass.updateSize(false);
                },
            },
            {
                type: "text",
                displayName: "Font Family",
                editable: true,

                get: (element: HTMLElement) => element.style.fontFamily,
                set: (element: HTMLElement, value: string) => {
                    const elementClass = GeneralUtil.elementToClassElement(element) as DraggableLabel;

                    elementClass.shadowLabel.style.fontFamily = value;
                    elementClass.mirror.style.fontFamily = value;
                    elementClass.label.style.fontFamily = value;
                    elementClass.updateSize(false);
                },
            },
            {
                type: "checkbox",
                displayName: "Shadow",
                editable: true,

                get: (element: HTMLElement) => {
                    const elementClass = GeneralUtil.elementToClassElement(element) as DraggableLabel;

                    return elementClass.hasShadow;
                },
                set: (element: HTMLElement) => {
                    const elementClass = GeneralUtil.elementToClassElement(element) as DraggableLabel;

                    elementClass.shadow(!elementClass.hasShadow);
                    elementClass.label.dispatchEvent(new Event("input"));
                },
            },
        ],
    ],
    [
        "draggable-scrolling_panel",
        [
            {
                type: "string",
                displayName: "Width",
                editable: true,

                get: (element: HTMLElement) => element.style.width,
                set: (element: HTMLElement, value: string) => {
                    const elementClass = GeneralUtil.elementToClassElement(element) as DraggableScrollingPanel;
                    elementClass.panel.style.width = value;
                    elementClass.basePanel.style.width = value;

                    elementClass.slider.updateHandle();
                },
            },
            {
                type: "string",
                displayName: "Height",
                editable: true,

                get: (element: HTMLElement) => element.style.height,
                set: (element: HTMLElement, value: string) => {
                    const elementClass = GeneralUtil.elementToClassElement(element) as DraggableScrollingPanel;
                    elementClass.panel.style.height = value;
                    elementClass.basePanel.style.height = value;

                    elementClass.slider.updateHandle();
                },
            },
            {
                type: "string",
                displayName: "Left",
                editable: true,

                get: (element: HTMLElement) => element.parentElement!.style.left,
                set: (element: HTMLElement, value: string) => (element.parentElement!.style.left = value),
            },
            {
                type: "string",
                displayName: "Top",
                editable: true,

                get: (element: HTMLElement) => element.parentElement!.style.top,
                set: (element: HTMLElement, value: string) => (element.parentElement!.style.top = value),
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
]);

let currentInputs: HTMLInputElement[] = [];

export function updatePropertiesArea(): void {
    const propertiesArea = document.getElementById("properties")!;

    // Removes old event listeners
    for (let input of currentInputs) {
        input.oninput = null;
        input.onclick = null;
    }

    const properties = propertiesMap.get(selectedElement?.classList[0]!)!;

    // Clear the old inputs
    currentInputs = [];

    propertiesArea.innerHTML = "";

    if (!selectedElement) return;
    for (let property of properties) {
        const input = document.createElement("input");
        input.type = property.type;
        input.className = "propertyInput";

        let value: string | boolean | undefined;
        if (property.get) {
            value = property.get(selectedElement!)!;
        }

        // Buttons
        if (property.type === "button") {
            input.value = property.displayName;
            input.className = "propertyInputButton";
            input.onclick = function () {
                property.set(selectedElement!, value as string);
            }

            currentInputs.push(input);
            propertiesArea.appendChild(input);
            propertiesArea.appendChild(document.createElement("br"));
            continue;
        }

        // Different input types
        if (property.type === "checkbox") input.checked = value as boolean;
        else if (property.type === "text") {
            input.value = value as string;
            input.spellcheck = false;
        }
        else if (property.type === "number") input.value = value as string;

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
