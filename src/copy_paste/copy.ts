import { GlobalElementMapValue, selectedElement, setCopiedElementData } from "../index.js";
import { DraggableLabel } from "../elements/label.js";
import { GeneralUtil } from "../util/generalUtil.js";
import { DraggablePanel } from "../elements/panel.js";
import { DraggableCollectionPanel } from "../elements/collectionPanel.js";
import { DraggableCanvas } from "../elements/canvas.js";
import { StringUtil } from "../util/stringUtil.js";
import { DraggableButton } from "../elements/button.js";
import { config } from "../CONFIG.js";
import { DraggableScrollingPanel } from "../elements/scrollingPanel.js";

export interface CopiedElementData {
    [key: string]: any;
    children?: CopiedElementData[];
}

function processChildren(mainElement: HTMLElement): CopiedElementData[] {
    const children: HTMLElement[] = Array.from(mainElement.children) as HTMLElement[];

    // Processes the children of the element being copied
    const childrenCopiedData: CopiedElementData[] = [];
    for (const child of children) {
        if (child.dataset.skip == "true") continue;
        const childClassElement: GlobalElementMapValue | undefined = GeneralUtil.elementToClassElement(child);
        if (!childClassElement) continue;

        const getChildCopiedData = conversionMap.get(childClassElement.getMainHTMLElement().classList[0]!);

        if (!getChildCopiedData) continue;
        const childCopiedData: CopiedElementData | undefined = getChildCopiedData(childClassElement);

        if (childCopiedData) childrenCopiedData.push(childCopiedData);
    }

    return childrenCopiedData;
}

export const conversionMap: Map<string, (elementClass: GlobalElementMapValue) => CopiedElementData | undefined> = new Map([
    [
        "draggable-label",
        (elementClass: GlobalElementMapValue): CopiedElementData | undefined => {
            const mainElement: HTMLTextAreaElement = elementClass.getMainHTMLElement() as HTMLTextAreaElement;
            if (!(elementClass instanceof DraggableLabel)) return undefined;

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
        (elementClass: GlobalElementMapValue): CopiedElementData | undefined => {
            const mainElement: HTMLTextAreaElement = elementClass.getMainHTMLElement() as HTMLTextAreaElement;
            if (!(elementClass instanceof DraggablePanel)) return undefined;

            const data: CopiedElementData = {
                type: "draggable-panel",
                oldId: mainElement.dataset.id,

                width: StringUtil.cssDimToNumber(mainElement.style.width),
                height: StringUtil.cssDimToNumber(mainElement.style.height),
                left: StringUtil.cssDimToNumber(mainElement.style.left),
                top: StringUtil.cssDimToNumber(mainElement.style.top),
            };

            const childrenCopiedData = processChildren(mainElement);

            if (childrenCopiedData.length > 0) data.children = childrenCopiedData;

            return data;
        },
    ],
    [
        "draggable-collection_panel",
        (elementClass: GlobalElementMapValue): CopiedElementData | undefined => {
            const mainElement: HTMLTextAreaElement = elementClass.getMainHTMLElement() as HTMLTextAreaElement;
            if (!(elementClass instanceof DraggableCollectionPanel)) return undefined;

            const data: CopiedElementData = {
                type: "draggable-collection_panel",
                oldId: mainElement.dataset.id,

                width: StringUtil.cssDimToNumber(mainElement.style.width),
                height: StringUtil.cssDimToNumber(mainElement.style.height),
                left: StringUtil.cssDimToNumber(mainElement.style.left),
                top: StringUtil.cssDimToNumber(mainElement.style.top),
                collectionName: mainElement.dataset.collectionName,
            };

            const childrenCopiedData = processChildren(mainElement);

            if (childrenCopiedData.length > 0) data.children = childrenCopiedData;

            return data;
        },
    ],
    [
        "draggable-canvas",
        (elementClass: GlobalElementMapValue): CopiedElementData | undefined => {
            const mainElement: HTMLTextAreaElement = elementClass.getMainHTMLElement() as HTMLTextAreaElement;
            if (!(elementClass instanceof DraggableCanvas)) return undefined;

            const data: CopiedElementData = {
                type: "draggable-canvas",
                oldId: mainElement.dataset.id,

                width: StringUtil.cssDimToNumber(mainElement.style.width),
                height: StringUtil.cssDimToNumber(mainElement.style.height),
                left: StringUtil.cssDimToNumber(mainElement.style.left),
                top: StringUtil.cssDimToNumber(mainElement.style.top),
                imageName: mainElement.dataset.imageName,
            };

            const childrenCopiedData = processChildren(mainElement);

            if (childrenCopiedData.length > 0) data.children = childrenCopiedData;

            return data;
        },
    ],
    [
        "draggable-button",
        (elementClass: GlobalElementMapValue): CopiedElementData | undefined => {
            const mainElement: HTMLTextAreaElement = elementClass.getMainHTMLElement() as HTMLTextAreaElement;
            if (!(elementClass instanceof DraggableButton)) return undefined;

            const copyData: CopiedElementData = {
                type: "draggable-button",
                oldId: mainElement.dataset.id,

                width: StringUtil.cssDimToNumber(mainElement.style.width),
                height: StringUtil.cssDimToNumber(mainElement.style.height),
                left: StringUtil.cssDimToNumber(mainElement.style.left),
                top: StringUtil.cssDimToNumber(mainElement.style.top),

                defaultTexture: mainElement.dataset.defaultImageName,
                hoverTexture: mainElement.dataset.hoverImageName,
                pressedTexture: mainElement.dataset.pressedImageName,
                displayTexture: mainElement.dataset.displayImageName,
                collectionIndex: mainElement.dataset.collectionIndex,
            };

            if (elementClass.displayText) {
                copyData.buttonLabel = conversionMap.get("draggable-label")!(elementClass.displayText!);
            }

            if (elementClass.displayCanvas) {
                copyData.displayCanvas = conversionMap.get("draggable-canvas")!(elementClass.displayCanvas!);
            }

            return copyData;
        },
    ],
    [
        "draggable-scrolling_panel",
        (elementClass: GlobalElementMapValue): CopiedElementData | undefined => {
            const mainElement: HTMLTextAreaElement = elementClass.getMainHTMLElement() as HTMLTextAreaElement;
            if (!(elementClass instanceof DraggableScrollingPanel)) return undefined;

            const data: CopiedElementData = {
                type: "draggable-scrolling_panel",
                oldId: mainElement.dataset.id,

                width: StringUtil.cssDimToNumber(mainElement.style.width),
                height: StringUtil.cssDimToNumber(mainElement.style.height),
                left: StringUtil.cssDimToNumber(mainElement.style.left),
                top: StringUtil.cssDimToNumber(mainElement.style.top),
            };

            const childrenCopiedData = processChildren(mainElement);

            if (childrenCopiedData.length > 0) data.children = childrenCopiedData;

            return data;
        },
    ],
]);

export class Copier {
    public static copyElement(id: string): void {

        const elementClass: GlobalElementMapValue = GeneralUtil.idToClassElement(id)!;
        if (!elementClass) return;

        const copiedElementConversionFunction: (elementClass: GlobalElementMapValue) => CopiedElementData | undefined = conversionMap.get(
            elementClass.getMainHTMLElement().classList[0]!
        )!;

        if (!copiedElementConversionFunction) return;

        console.log(copiedElementConversionFunction, "copiedElementConversionFunction", elementClass);
        const copiedElement: CopiedElementData | undefined = copiedElementConversionFunction(elementClass);
        console.log(copiedElement, "copiedElement");
        if (!copiedElement) return;

        setCopiedElementData(copiedElement);
    }
}
