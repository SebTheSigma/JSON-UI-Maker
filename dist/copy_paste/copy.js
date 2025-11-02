import { setCopiedElementData } from "../index.js";
import { DraggableLabel } from "../elements/label.js";
import { GeneralUtil } from "../util/generalUtil.js";
import { DraggablePanel } from "../elements/panel.js";
import { DraggableCollectionPanel } from "../elements/collectionPanel.js";
import { DraggableCanvas } from "../elements/canvas.js";
import { StringUtil } from "../util/stringUtil.js";
import { DraggableButton } from "../elements/button.js";
import { DraggableScrollingPanel } from "../elements/scrollingPanel.js";
function processChildren(mainElement) {
    const children = Array.from(mainElement.children);
    // Processes the children of the element being copied
    const childrenCopiedData = [];
    for (const child of children) {
        if (child.dataset.skip == "true")
            continue;
        const childClassElement = GeneralUtil.elementToClassElement(child);
        if (!childClassElement)
            continue;
        const getChildCopiedData = conversionMap.get(childClassElement.getMainHTMLElement().classList[0]);
        if (!getChildCopiedData)
            continue;
        const childCopiedData = getChildCopiedData(childClassElement);
        if (childCopiedData)
            childrenCopiedData.push(childCopiedData);
    }
    return childrenCopiedData;
}
export const conversionMap = new Map([
    [
        "draggable-label",
        (elementClass) => {
            const mainElement = elementClass.getMainHTMLElement();
            if (!(elementClass instanceof DraggableLabel))
                return undefined;
            return {
                type: "draggable-label",
                oldId: mainElement.dataset.id,
                text: mainElement.value,
                textAlign: mainElement.style.textAlign,
                fontScale: mainElement.style.fontSize.replace("em", ""),
                includeTextPrompt: elementClass.bindingsTextPrompt !== undefined,
                left: StringUtil.cssDimToNumber(mainElement.style.left),
                top: StringUtil.cssDimToNumber(mainElement.style.top),
                fontFamily: mainElement.style.fontFamily,
                hasShadow: elementClass.hasShadow,
            };
        },
    ],
    [
        "draggable-panel",
        (elementClass) => {
            const mainElement = elementClass.getMainHTMLElement();
            if (!(elementClass instanceof DraggablePanel))
                return undefined;
            const data = {
                type: "draggable-panel",
                oldId: mainElement.dataset.id,
                width: StringUtil.cssDimToNumber(mainElement.style.width),
                height: StringUtil.cssDimToNumber(mainElement.style.height),
                left: StringUtil.cssDimToNumber(mainElement.style.left),
                top: StringUtil.cssDimToNumber(mainElement.style.top),
            };
            const childrenCopiedData = processChildren(mainElement);
            if (childrenCopiedData.length > 0)
                data.children = childrenCopiedData;
            return data;
        },
    ],
    [
        "draggable-collection_panel",
        (elementClass) => {
            const mainElement = elementClass.getMainHTMLElement();
            if (!(elementClass instanceof DraggableCollectionPanel))
                return undefined;
            const data = {
                type: "draggable-collection_panel",
                oldId: mainElement.dataset.id,
                width: StringUtil.cssDimToNumber(mainElement.style.width),
                height: StringUtil.cssDimToNumber(mainElement.style.height),
                left: StringUtil.cssDimToNumber(mainElement.style.left),
                top: StringUtil.cssDimToNumber(mainElement.style.top),
                collectionName: mainElement.dataset.collectionName,
            };
            const childrenCopiedData = processChildren(mainElement);
            if (childrenCopiedData.length > 0)
                data.children = childrenCopiedData;
            return data;
        },
    ],
    [
        "draggable-canvas",
        (elementClass) => {
            const mainElement = elementClass.getMainHTMLElement();
            if (!(elementClass instanceof DraggableCanvas))
                return undefined;
            const data = {
                type: "draggable-canvas",
                oldId: mainElement.dataset.id,
                width: StringUtil.cssDimToNumber(mainElement.style.width),
                height: StringUtil.cssDimToNumber(mainElement.style.height),
                left: StringUtil.cssDimToNumber(mainElement.style.left),
                top: StringUtil.cssDimToNumber(mainElement.style.top),
                imagePath: mainElement.dataset.imagePath,
            };
            const childrenCopiedData = processChildren(mainElement);
            if (childrenCopiedData.length > 0)
                data.children = childrenCopiedData;
            return data;
        },
    ],
    [
        "draggable-button",
        (elementClass) => {
            const mainElement = elementClass.getMainHTMLElement();
            if (!(elementClass instanceof DraggableButton))
                return undefined;
            const copyData = {
                type: "draggable-button",
                oldId: mainElement.dataset.id,
                width: StringUtil.cssDimToNumber(mainElement.style.width),
                height: StringUtil.cssDimToNumber(mainElement.style.height),
                left: StringUtil.cssDimToNumber(mainElement.style.left),
                top: StringUtil.cssDimToNumber(mainElement.style.top),
                defaultTexture: mainElement.dataset.defaultImagePath,
                hoverTexture: mainElement.dataset.hoverImagePath,
                pressedTexture: mainElement.dataset.pressedImagePath,
                displayTexture: mainElement.dataset.displayImagePath,
                collectionIndex: mainElement.dataset.collectionIndex,
            };
            if (elementClass.displayText) {
                copyData.buttonLabel = conversionMap.get("draggable-label")(elementClass.displayText);
            }
            if (elementClass.displayCanvas) {
                copyData.displayCanvas = conversionMap.get("draggable-canvas")(elementClass.displayCanvas);
            }
            return copyData;
        },
    ],
    [
        "draggable-scrolling_panel",
        (elementClass) => {
            const mainElement = elementClass.getMainHTMLElement();
            if (!(elementClass instanceof DraggableScrollingPanel))
                return undefined;
            const data = {
                type: "draggable-scrolling_panel",
                oldId: mainElement.dataset.id,
                width: StringUtil.cssDimToNumber(mainElement.style.width),
                height: StringUtil.cssDimToNumber(mainElement.style.height),
                left: StringUtil.cssDimToNumber(mainElement.style.left),
                top: StringUtil.cssDimToNumber(mainElement.style.top),
            };
            const childrenCopiedData = processChildren(mainElement);
            if (childrenCopiedData.length > 0)
                data.children = childrenCopiedData;
            return data;
        },
    ],
]);
export class Copier {
    static copyElement(id) {
        const elementClass = GeneralUtil.idToClassElement(id);
        if (!elementClass)
            return;
        const copiedElementConversionFunction = conversionMap.get(elementClass.getMainHTMLElement().classList[0]);
        if (!copiedElementConversionFunction)
            return;
        console.log(copiedElementConversionFunction, "copiedElementConversionFunction", elementClass);
        const copiedElement = copiedElementConversionFunction(elementClass);
        console.log(copiedElement, "copiedElement");
        if (!copiedElement)
            return;
        setCopiedElementData(copiedElement);
    }
}
//# sourceMappingURL=copy.js.map