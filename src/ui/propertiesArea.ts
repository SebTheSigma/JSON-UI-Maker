import { config } from "../CONFIG.js";
import { DraggableButton } from "../elements/button.js";
import { DraggableCanvas } from "../elements/canvas.js";
import { DraggableCollectionPanel } from "../elements/collectionPanel.js";
import { DraggableLabel } from "../elements/label.js";
import { DraggablePanel } from "../elements/panel.js";
import { DraggableScrollingPanel } from "../elements/scrollingPanel.js";
import { ElementSharedFuncs } from "../elements/sharedElement.js";
import { Builder, GLOBAL_ELEMENT_MAP, selectedElement } from "../index.js";
import { GeneralUtil } from "../util/generalUtil.js";
import { MathUtil } from "../util/mathUtil.js";
import { StringUtil } from "../util/stringUtil.js";
import { chooseImageModal } from "./modals/chooseImage.js";
import { undoRedoManager } from "../keyboard/undoRedo.js";

export const propertiesMap = new Map([
    [
        "draggable-panel",
        [
            {
                type: "text",
                displayName: "Width",
                editable: true,

                get: (element: HTMLElement) => element.style.width,
                set: (element: HTMLElement, value: string) => {
                    element.style.width = value;
                    ElementSharedFuncs.updateCenterCirclePosition(GeneralUtil.elementToClassElement(element) as DraggablePanel);
                },
            },
            {
                type: "text",
                displayName: "Height",
                editable: true,

                get: (element: HTMLElement) => element.style.height,
                set: (element: HTMLElement, value: string) => {
                    element.style.height = value;
                    ElementSharedFuncs.updateCenterCirclePosition(GeneralUtil.elementToClassElement(element) as DraggablePanel);
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
                type: "button",
                displayName: "Fill Parent",
                editable: true,

                set: (element: HTMLElement, value: string) => {
                    const parent = element.parentElement!;
                    if (parent.dataset.id == config.rootElement!.dataset.id) return;

                    element.style.width = parent.style.width;
                    element.style.height = parent.style.height;
                    element.style.left = "0px";
                    element.style.top = "0px";
                    ElementSharedFuncs.updateCenterCirclePosition(GeneralUtil.elementToClassElement(element) as DraggablePanel);
                    updatePropertiesArea();
                },
            },
        ],
    ],
    [
        "draggable-canvas",
        [
            {
                type: "text",
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
                type: "text",
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
                type: "texture",
                displayName: "Texture",
                editable: true,

                get: (element: HTMLElement) => element.dataset.imagePath,
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
                    if (parent.dataset.id == config.rootElement!.dataset.id) return;
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
                        } else {
                            console.log(adjustedHeight, height, 2);
                            classElement.drawImage(adjustedHeight, height);
                        }
                    }

                    element.style.left = "0px";
                    element.style.top = "0px";
                    ElementSharedFuncs.updateCenterCirclePosition(classElement);
                    updatePropertiesArea();
                },
            },
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
                type: "texture",
                displayName: "Default Texture",
                editable: true,

                get: (element: HTMLElement) => element.dataset.defaultImagePath,
                set: (element: HTMLElement, value: string) => {
                    const elementClass = GeneralUtil.elementToClassElement(element) as DraggableButton;

                    elementClass.setDefaultImage(value);
                },
            },
            {
                type: "texture",
                displayName: "Hover Texture",
                editable: true,

                get: (element: HTMLElement) => element.dataset.hoverImagePath,
                set: (element: HTMLElement, value: string) => {
                    const elementClass = GeneralUtil.elementToClassElement(element) as DraggableButton;

                    elementClass.setHoverImage(value);
                },
            },
            {
                type: "texture",
                displayName: "Pressed Texture",
                editable: true,

                get: (element: HTMLElement) => element.dataset.pressedImagePath,
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
                type: "texture",
                displayName: "Display Texture",
                editable: true,

                get: (element: HTMLElement) => element.dataset.displayImagePath,
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
                    if (parent.dataset.id == config.rootElement!.dataset.id) return;
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
                        } else {
                            console.log(adjustedHeight, height, 2);
                            classElement.drawImage(adjustedHeight, height);
                        }
                    }

                    element.style.left = "0px";
                    element.style.top = "0px";
                    ElementSharedFuncs.updateCenterCirclePosition(classElement);
                    updatePropertiesArea();
                },
            },
        ],
    ],
    [
        "draggable-collection_panel",
        [
            {
                type: "text",
                displayName: "Width",
                editable: true,

                get: (element: HTMLElement) => element.style.width,
                set: (element: HTMLElement, value: string) => {
                    element.style.width = value;
                    ElementSharedFuncs.updateCenterCirclePosition(GeneralUtil.elementToClassElement(element) as DraggableCollectionPanel);
                },
            },
            {
                type: "text",
                displayName: "Height",
                editable: true,

                get: (element: HTMLElement) => element.style.height,
                set: (element: HTMLElement, value: string) => {
                    element.style.height = value;
                    ElementSharedFuncs.updateCenterCirclePosition(GeneralUtil.elementToClassElement(element) as DraggableCollectionPanel);
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
                displayName: "Collection Name",
                editable: true,

                get: (element: HTMLElement) => element.dataset.collectionName,
                set: (element: HTMLElement, value: string) => (element.dataset.collectionName = value),
            },
            {
                type: "button",
                displayName: "Fill Parent",
                editable: true,

                set: (element: HTMLElement, value: string) => {
                    const parent = element.parentElement!;
                    if (parent.dataset.id == config.rootElement!.dataset.id) return;
                    element.style.width = parent.style.width;
                    element.style.height = parent.style.height;
                    element.style.left = "0px";
                    element.style.top = "0px";
                    ElementSharedFuncs.updateCenterCirclePosition(GeneralUtil.elementToClassElement(element) as DraggableCollectionPanel);
                    updatePropertiesArea();
                },
            },
        ],
    ],
    [
        "draggable-label",
        [
            {
                type: "text",
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
                type: "text",
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
                type: "text",
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
                type: "text",
                displayName: "Font Scale",
                editable: true,

                get: (element: HTMLElement) => {
                    const elementClass = GeneralUtil.elementToClassElement(element) as DraggableLabel;
                    return elementClass.lastAttemptedScaleFactor;
                },
                set: (element: HTMLElement, value: string) => {
                    const elementClass = GeneralUtil.elementToClassElement(element) as DraggableLabel;

                    console.log(value);
                    elementClass.lastAttemptedScaleFactor = value;

                    element.style.fontSize = `${value}em`;
                    elementClass.mirror.style.fontSize = `${value}em`;
                    elementClass.shadowLabel.style.fontSize = `${value}em`;
                    elementClass.updateSize(false);
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
                    // Don't call updateSize here as it causes the font validation issue
                    // elementClass.updateSize(false);
                    elementClass.label.dispatchEvent(new Event("input"));
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
                    elementClass.updateSize(false);
                    elementClass.label.dispatchEvent(new Event("input"));
                },
            },
        ],
    ],
    [
        "draggable-scrolling_panel",
        [
            {
                type: "text",
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
                type: "text",
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
                type: "text",
                displayName: "Left",
                editable: true,

                get: (element: HTMLElement) => element.parentElement!.style.left,
                set: (element: HTMLElement, value: string) => (element.parentElement!.style.left = value),
            },
            {
                type: "text",
                displayName: "Top",
                editable: true,

                get: (element: HTMLElement) => element.parentElement!.style.top,
                set: (element: HTMLElement, value: string) => (element.parentElement!.style.top = value),
            },
            {
                type: "text",
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
                    const classElement = GeneralUtil.elementToClassElement(element) as DraggableScrollingPanel;
                    const parent = classElement.basePanel.parentElement!;
                    if (parent.dataset.id == config.rootElement!.dataset.id) return;

                    classElement.panel.style.width = parent.style.width;
                    classElement.panel.style.height = parent.style.height;
                    classElement.basePanel.style.width = parent.style.width;
                    classElement.basePanel.style.height = parent.style.height;

                    classElement.basePanel.style.left = "0px";
                    classElement.basePanel.style.top = "0px";

                    classElement.slider.updateHandle();
                    updatePropertiesArea();
                },
            },
        ],
    ],
]);

let currentInputs: HTMLInputElement[] = [];

export function updatePropertiesArea(): void {
    console.log("updatePropertiesArea");
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
            };

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
        } else if (property.type === "number") input.value = value as string;

        if (property.type === "texture") {
            input.type = "text";
            input.readOnly = true;
            input.value = value as string;

            setTimeout(() => GeneralUtil.autoResizeInput(input), 0);
        }

        const label = document.createElement("label");
        label.textContent = `${property.displayName}: `;

        const isEditableLabel = document.createElement("label");
        isEditableLabel.className = "isEditableLabel";
        isEditableLabel.textContent = `${property.editable ? "Editable" : "Not Editable"}`;

        if (property.editable) {
            input.contentEditable = "true";

            if (property.type === "texture") {
                input.onclick = async function () {
                    const oldValue = input.value;
                    const filePath: string = await chooseImageModal();
                    input.value = filePath;

                    // Record property change for undo/redo
                    const newState: any = {};
                    const oldState: any = {};
                    newState[property.displayName.toLowerCase().replace(" ", "_")] = filePath;
                    oldState[property.displayName.toLowerCase().replace(" ", "_")] = oldValue;

                    undoRedoManager.push({
                        type: "modify",
                        elementId: selectedElement!.dataset.id,
                        previousState: oldState,
                        newState: newState,
                    });

                    property.set(selectedElement!, filePath);

                    GeneralUtil.autoResizeInput(input);
                };
            } else {
                let initialValue = input.value;
                let hasUnsavedChanges = false;

                // Special handling for Font Family to avoid validation issues
                if (property.displayName === "Font Family") {
                    input.oninput = function () {
                        hasUnsavedChanges = true;
                        // Only set the font family directly without triggering updateSize
                        selectedElement!.style.fontFamily = input.value;
                        const elementClass = GeneralUtil.elementToClassElement(selectedElement!) as any;
                        if (elementClass && elementClass.shadowLabel) {
                            elementClass.shadowLabel.style.fontFamily = input.value;
                        }
                        if (elementClass && elementClass.mirror) {
                            elementClass.mirror.style.fontFamily = input.value;
                        }
                    };
                } else {
                    // Delay the property.set call to avoid interrupting typing
                    let timeoutId: number | null = null;
                    input.oninput = function () {
                        if (property.type === "checkbox") {
                            console.log("HELLO");
                            const newState: any = {};
                            const oldState: any = {};
                            newState[property.displayName.toLowerCase().replace(" ", "_")] = input.value;
                            oldState[property.displayName.toLowerCase().replace(" ", "_")] = initialValue;

                            undoRedoManager.push({
                                type: "modify",
                                elementId: selectedElement!.dataset.id,
                                previousState: oldState,
                                newState: newState,
                            });

                            hasUnsavedChanges = false;
                        } else hasUnsavedChanges = true;

                        if (timeoutId) clearTimeout(timeoutId);
                        timeoutId = window.setTimeout(() => {
                            property.set(selectedElement!, input.value);
                        }, 100); // Small delay to avoid interrupting typing
                    };
                }

                input.onfocus = function () {
                    initialValue = input.value;
                    hasUnsavedChanges = false;
                };

                input.onblur = function () {
                    if (hasUnsavedChanges && initialValue !== input.value) {
                        console.warn("HELLO");
                        // Record property change for undo/redo only when focus leaves and value changed
                        const newState: any = {};
                        const oldState: any = {};
                        newState[property.displayName.toLowerCase().replace(" ", "_")] = input.value;
                        oldState[property.displayName.toLowerCase().replace(" ", "_")] = initialValue;

                        undoRedoManager.push({
                            type: "modify",
                            elementId: selectedElement!.dataset.id,
                            previousState: oldState,
                            newState: newState,
                        });

                        hasUnsavedChanges = false;
                        // For font family, call the property setter after recording undo
                        if (property.displayName === "Font Family") {
                            property.set(selectedElement!, input.value);
                        }
                    }
                };

                input.onkeydown = function (e) {
                    if (e.key === "Enter" && hasUnsavedChanges) {
                        // Record property change for undo/redo on Enter key
                        const newState: any = {};
                        const oldState: any = {};
                        newState[property.displayName.toLowerCase().replace(" ", "_")] = input.value;
                        oldState[property.displayName.toLowerCase().replace(" ", "_")] = initialValue;

                        undoRedoManager.push({
                            type: "modify",
                            elementId: selectedElement!.dataset.id,
                            previousState: oldState,
                            newState: newState,
                        });

                        initialValue = input.value;
                        hasUnsavedChanges = false;
                        // For font family, call the property setter after recording undo
                        if (property.displayName === "Font Family") {
                            property.set(selectedElement!, input.value);
                        }
                    }
                };
            }
        } else input.contentEditable = "false";

        currentInputs.push(input);

        propertiesArea.appendChild(label);
        propertiesArea.appendChild(input);
        propertiesArea.appendChild(isEditableLabel);
        propertiesArea.appendChild(document.createElement("br"));
    }
}
