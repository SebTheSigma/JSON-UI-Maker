import { config } from "../CONFIG.js";
import { ElementSharedFuncs } from "../elements/sharedElement.js";
import { selectedElement } from "../index.js";
import { GeneralUtil } from "../util/generalUtil.js";
import { StringUtil } from "../util/stringUtil.js";
export const propertiesMap = new Map([
    [
        "draggable-panel",
        [
            {
                type: "text",
                displayName: "Width",
                editable: true,
                get: (element) => element.style.width,
                set: (element, value) => {
                    element.style.width = value;
                    ElementSharedFuncs.updateCenterCirclePosition(GeneralUtil.elementToClassElement(element));
                },
            },
            {
                type: "text",
                displayName: "Height",
                editable: true,
                get: (element) => element.style.height,
                set: (element, value) => {
                    element.style.height = value;
                    ElementSharedFuncs.updateCenterCirclePosition(GeneralUtil.elementToClassElement(element));
                },
            },
            {
                type: "text",
                displayName: "Left",
                editable: true,
                get: (element) => element.style.left,
                set: (element, value) => (element.style.left = value),
            },
            {
                type: "text",
                displayName: "Top",
                editable: true,
                get: (element) => element.style.top,
                set: (element, value) => (element.style.top = value),
            },
            {
                type: "text",
                displayName: "Layer",
                editable: true,
                get: (element) => element.style.zIndex,
                set: (element, value) => (element.style.zIndex = value),
            },
            {
                type: "button",
                displayName: "Fill Parent",
                editable: true,
                set: (element, value) => {
                    const parent = element.parentElement;
                    if (parent.dataset.id == config.rootElement.dataset.id)
                        return;
                    element.style.width = parent.style.width;
                    element.style.height = parent.style.height;
                    element.style.left = '0px';
                    element.style.top = '0px';
                    ElementSharedFuncs.updateCenterCirclePosition(GeneralUtil.elementToClassElement(element));
                    updatePropertiesArea();
                },
            }
        ],
    ],
    [
        "draggable-canvas",
        [
            {
                type: "text",
                displayName: "Width",
                editable: true,
                get: (element) => element.style.width,
                set: (element, value) => {
                    const classElement = GeneralUtil.elementToClassElement(element);
                    const numVal = StringUtil.cssDimToNumber(value);
                    const height = StringUtil.cssDimToNumber(classElement.canvas.style.height);
                    if (classElement.nineSlice) {
                        classElement.drawImage(numVal, height);
                    }
                    else {
                        classElement.drawImage(numVal, numVal / classElement.aspectRatio);
                    }
                    ElementSharedFuncs.updateCenterCirclePosition(classElement);
                },
            },
            {
                type: "text",
                displayName: "Height",
                editable: true,
                get: (element) => element.style.height,
                set: (element, value) => {
                    const classElement = GeneralUtil.elementToClassElement(element);
                    const numVal = StringUtil.cssDimToNumber(value);
                    const width = StringUtil.cssDimToNumber(classElement.canvas.style.width);
                    if (classElement.nineSlice) {
                        classElement.drawImage(width, numVal);
                    }
                    else {
                        classElement.drawImage(numVal * classElement.aspectRatio, numVal);
                    }
                    ElementSharedFuncs.updateCenterCirclePosition(classElement);
                },
            },
            {
                type: "text",
                displayName: "Left",
                editable: true,
                get: (element) => element.style.left,
                set: (element, value) => (element.style.left = value),
            },
            {
                type: "text",
                displayName: "Top",
                editable: true,
                get: (element) => element.style.top,
                set: (element, value) => (element.style.top = value),
            },
            {
                type: "text",
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
                    elementClass.changeImage(value);
                },
            },
            {
                type: "button",
                displayName: "Fill Parent",
                editable: true,
                set: (element, value) => {
                    const parent = element.parentElement;
                    if (parent.dataset.id == config.rootElement.dataset.id)
                        return;
                    const classElement = GeneralUtil.elementToClassElement(element);
                    const height = StringUtil.cssDimToNumber(parent.style.height);
                    const width = StringUtil.cssDimToNumber(parent.style.width);
                    const adjustedWidth = width / classElement.aspectRatio;
                    const adjustedHeight = height * classElement.aspectRatio;
                    if (classElement.nineSlice) {
                        classElement.drawImage(width, height);
                    }
                    else {
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
                    updatePropertiesArea();
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
                get: (element) => element.style.width,
                set: (element, value) => {
                    const elementClass = GeneralUtil.elementToClassElement(element);
                    elementClass.drawImage(parseFloat(value), elementClass.canvas.height);
                    ElementSharedFuncs.updateCenterCirclePosition(elementClass);
                },
            },
            {
                type: "text",
                displayName: "Height",
                editable: true,
                get: (element) => element.style.height,
                set: (element, value) => {
                    const elementClass = GeneralUtil.elementToClassElement(element);
                    elementClass.drawImage(elementClass.canvas.width, parseFloat(value));
                    ElementSharedFuncs.updateCenterCirclePosition(elementClass);
                },
            },
            {
                type: "text",
                displayName: "Left",
                editable: true,
                get: (element) => element.style.left,
                set: (element, value) => (element.style.left = value),
            },
            {
                type: "text",
                displayName: "Top",
                editable: true,
                get: (element) => element.style.top,
                set: (element, value) => (element.style.top = value),
            },
            {
                type: "text",
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
                    elementClass.setDefaultImage(value);
                },
            },
            {
                type: "text",
                displayName: "Hover Texture",
                editable: true,
                get: (element) => element.dataset.hoverImageName,
                set: (element, value) => {
                    const elementClass = GeneralUtil.elementToClassElement(element);
                    elementClass.setHoverImage(value);
                },
            },
            {
                type: "text",
                displayName: "Pressed Texture",
                editable: true,
                get: (element) => element.dataset.pressedImageName,
                set: (element, value) => {
                    const elementClass = GeneralUtil.elementToClassElement(element);
                    elementClass.setPressedImage(value);
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
                    const elementClass = GeneralUtil.elementToClassElement(element);
                    elementClass.setDisplayImage(value);
                },
            },
            {
                type: "button",
                displayName: "Fill Parent",
                editable: true,
                set: (element, value) => {
                    const parent = element.parentElement;
                    if (parent.dataset.id == config.rootElement.dataset.id)
                        return;
                    const classElement = GeneralUtil.elementToClassElement(element);
                    const height = StringUtil.cssDimToNumber(parent.style.height);
                    const width = StringUtil.cssDimToNumber(parent.style.width);
                    const adjustedWidth = width * classElement.aspectRatio;
                    const adjustedHeight = height * classElement.aspectRatio;
                    if (classElement.getCurrentlyRenderedState().json) {
                        classElement.drawImage(width, height);
                    }
                    else {
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
                    updatePropertiesArea();
                },
            }
        ],
    ],
    [
        "draggable-collection_panel",
        [
            {
                type: "text",
                displayName: "Width",
                editable: true,
                get: (element) => element.style.width,
                set: (element, value) => {
                    element.style.width = value;
                    ElementSharedFuncs.updateCenterCirclePosition(GeneralUtil.elementToClassElement(element));
                },
            },
            {
                type: "text",
                displayName: "Height",
                editable: true,
                get: (element) => element.style.height,
                set: (element, value) => {
                    element.style.height = value;
                    ElementSharedFuncs.updateCenterCirclePosition(GeneralUtil.elementToClassElement(element));
                },
            },
            {
                type: "text",
                displayName: "Left",
                editable: true,
                get: (element) => element.style.left,
                set: (element, value) => (element.style.left = value),
            },
            {
                type: "text",
                displayName: "Top",
                editable: true,
                get: (element) => element.style.top,
                set: (element, value) => (element.style.top = value),
            },
            {
                type: "text",
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
            {
                type: "button",
                displayName: "Fill Parent",
                editable: true,
                set: (element, value) => {
                    const parent = element.parentElement;
                    if (parent.dataset.id == config.rootElement.dataset.id)
                        return;
                    element.style.width = parent.style.width;
                    element.style.height = parent.style.height;
                    element.style.left = '0px';
                    element.style.top = '0px';
                    ElementSharedFuncs.updateCenterCirclePosition(GeneralUtil.elementToClassElement(element));
                    updatePropertiesArea();
                },
            }
        ],
    ],
    [
        "draggable-label",
        [
            {
                type: "text",
                displayName: "Left",
                editable: true,
                get: (element) => element.style.left,
                set: (element, value) => {
                    element.style.left = value;
                    const elementClass = GeneralUtil.elementToClassElement(element);
                    const offset = config.magicNumbers.labelToOffset(elementClass.label);
                    elementClass.shadowLabel.style.left = `${StringUtil.cssDimToNumber(elementClass.label.style.left) + elementClass.shadowOffsetX + offset[0]}px`;
                },
            },
            {
                type: "text",
                displayName: "Top",
                editable: true,
                get: (element) => element.style.top,
                set: (element, value) => {
                    element.style.top = value;
                    const elementClass = GeneralUtil.elementToClassElement(element);
                    const offset = config.magicNumbers.labelToOffset(elementClass.label);
                    elementClass.shadowLabel.style.top = `${StringUtil.cssDimToNumber(elementClass.label.style.top) + elementClass.shadowOffsetY + offset[1]}px`;
                },
            },
            {
                type: "text",
                displayName: "Layer",
                editable: true,
                get: (element) => element.style.zIndex,
                set: (element, value) => {
                    element.style.zIndex = value;
                    const elementClass = GeneralUtil.elementToClassElement(element);
                    elementClass.shadowLabel.style.zIndex = value;
                },
            },
            {
                type: "decimal",
                displayName: "Font Scale",
                editable: true,
                get: (element) => element.style.fontSize.replace("em", ""),
                set: (element, value) => {
                    const elementClass = GeneralUtil.elementToClassElement(element);
                    element.style.fontSize = `${value}em`;
                    elementClass.mirror.style.fontSize = `${value}em`;
                    elementClass.shadowLabel.style.fontSize = `${value}em`;
                    elementClass.updateSize();
                    elementClass.label.dispatchEvent(new Event("input"));
                },
            },
            {
                type: "text",
                displayName: "Text Align",
                editable: true,
                get: (element) => element.style.textAlign,
                set: (element, value) => {
                    const elementClass = GeneralUtil.elementToClassElement(element);
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
                get: (element) => element.style.fontFamily,
                set: (element, value) => {
                    const elementClass = GeneralUtil.elementToClassElement(element);
                    elementClass.shadowLabel.style.fontFamily = value;
                    elementClass.mirror.style.fontFamily = value;
                    elementClass.label.style.fontFamily = value;
                    elementClass.updateSize(false);
                    elementClass.label.dispatchEvent(new Event("input"));
                },
            },
            {
                type: "checkbox",
                displayName: "Shadow",
                editable: true,
                get: (element) => {
                    const elementClass = GeneralUtil.elementToClassElement(element);
                    return elementClass.hasShadow;
                },
                set: (element) => {
                    const elementClass = GeneralUtil.elementToClassElement(element);
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
                get: (element) => element.style.width,
                set: (element, value) => {
                    const elementClass = GeneralUtil.elementToClassElement(element);
                    elementClass.panel.style.width = value;
                    elementClass.basePanel.style.width = value;
                    elementClass.slider.updateHandle();
                },
            },
            {
                type: "text",
                displayName: "Height",
                editable: true,
                get: (element) => element.style.height,
                set: (element, value) => {
                    const elementClass = GeneralUtil.elementToClassElement(element);
                    elementClass.panel.style.height = value;
                    elementClass.basePanel.style.height = value;
                    elementClass.slider.updateHandle();
                },
            },
            {
                type: "text",
                displayName: "Left",
                editable: true,
                get: (element) => element.parentElement.style.left,
                set: (element, value) => (element.parentElement.style.left = value),
            },
            {
                type: "text",
                displayName: "Top",
                editable: true,
                get: (element) => element.parentElement.style.top,
                set: (element, value) => (element.parentElement.style.top = value),
            },
            {
                type: "text",
                displayName: "Layer",
                editable: true,
                get: (element) => element.style.zIndex,
                set: (element, value) => (element.style.zIndex = value),
            },
            {
                type: "button",
                displayName: "Fill Parent",
                editable: true,
                set: (element, value) => {
                    const classElement = GeneralUtil.elementToClassElement(element);
                    const parent = classElement.basePanel.parentElement;
                    if (parent.dataset.id == config.rootElement.dataset.id)
                        return;
                    classElement.panel.style.width = parent.style.width;
                    classElement.panel.style.height = parent.style.height;
                    classElement.basePanel.style.width = parent.style.width;
                    classElement.basePanel.style.height = parent.style.height;
                    classElement.basePanel.style.left = '0px';
                    classElement.basePanel.style.top = '0px';
                    classElement.slider.updateHandle();
                    updatePropertiesArea();
                },
            }
        ],
    ],
]);
let currentInputs = [];
export function updatePropertiesArea() {
    const propertiesArea = document.getElementById("properties");
    // Removes old event listeners
    for (let input of currentInputs) {
        input.oninput = null;
        input.onclick = null;
    }
    const properties = propertiesMap.get(selectedElement?.classList[0]);
    // Clear the old inputs
    currentInputs = [];
    propertiesArea.innerHTML = "";
    if (!selectedElement)
        return;
    for (let property of properties) {
        const input = document.createElement("input");
        input.type = property.type;
        input.className = "propertyInput";
        let value;
        if (property.get) {
            value = property.get(selectedElement);
        }
        // Buttons
        if (property.type === "button") {
            input.value = property.displayName;
            input.className = "propertyInputButton";
            input.onclick = function () {
                property.set(selectedElement, value);
            };
            currentInputs.push(input);
            propertiesArea.appendChild(input);
            propertiesArea.appendChild(document.createElement("br"));
            continue;
        }
        // Different input types
        if (property.type === "checkbox")
            input.checked = value;
        else if (property.type === "text") {
            input.value = value;
            input.spellcheck = false;
        }
        else if (property.type === "number")
            input.value = value;
        else if (property.type === "decimal") {
            input.value = value;
            input.step = "any";
        }
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