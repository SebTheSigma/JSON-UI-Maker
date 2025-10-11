import { Builder, copiedElementData, GLOBAL_ELEMENT_MAP, GlobalElementMapValue, images, selectedElement } from "../index.js";
import { DraggableLabel } from "../elements/label.js";
import { StringUtil } from "../util/stringUtil.js";
import { CopiedElementData } from "./copy.js";
import { DraggablePanel } from "../elements/panel.js";
import { ElementSharedFuncs } from "../elements/sharedElement.js";
import { DraggableCollectionPanel } from "../elements/collectionPanel.js";
import { config } from "../CONFIG.js";
import { DraggableCanvas } from "../elements/canvas.js";
import { Notification } from "../ui/notifs/noficationMaker.js";
import { DraggableButton } from "../elements/button.js";
import { is } from "cheerio/dist/commonjs/api/traversing.js";
import { DraggableScrollingPanel } from "../elements/scrollingPanel.js";

function processChildren(copiedElement: CopiedElementData, elementClassMainHTMLElement: HTMLElement) {
    if (copiedElement.children && copiedElement.children.length > 0) {
        for (const child of copiedElement.children) {
            const paste = pasteConversionMap.get(child.type);
            if (!paste) continue;
            paste(child, elementClassMainHTMLElement, true);
        }
    }
}

export const pasteConversionMap: Map<string, (copiedElement: CopiedElementData, parent: HTMLElement, isChild?: boolean) => void | undefined> = new Map([
    [
        "draggable-label",
        (copiedElement: CopiedElementData, parent: HTMLElement, isChild: boolean = false): void => {
            const id: string = StringUtil.generateRandomString(15);
            const label: DraggableLabel = new DraggableLabel(id, parent, {
                text: copiedElement.text,
                textAlign: copiedElement.textAlign,
                fontScale: copiedElement.fontScale,
                fontColor: copiedElement.fontColor,
                includeTextPrompt: copiedElement.includeTextPrompt,
            });

            label.shadowLabel.style.fontFamily = copiedElement.fontFamily;
            label.mirror.style.fontFamily = copiedElement.fontFamily;
            label.label.style.fontFamily = copiedElement.fontFamily;

            if (isChild) {
                label.label.style.left = `${copiedElement.left}px`;
                label.label.style.top = `${copiedElement.top}px`;

                const offset = config.magicNumbers.labelToOffset(label.label);
                label.shadowLabel.style.left = `${StringUtil.cssDimToNumber(label.label.style.left) + label.shadowOffsetX + offset[0]}px`;
                label.shadowLabel.style.top = `${StringUtil.cssDimToNumber(label.label.style.top) + label.shadowOffsetY + offset[1]}px`;
            }

            label.shadow(copiedElement.hasShadow);
            label.updateSize(true);

            GLOBAL_ELEMENT_MAP.set(id, label);

            if (!label) new Notification("Error pasting element", 5000, "error");
        },
    ],
    [
        "draggable-panel",
        (copiedElement: CopiedElementData, parent: HTMLElement, isChild: boolean = false): void => {
            const id: string = StringUtil.generateRandomString(15);
            const panel: DraggablePanel = new DraggablePanel(id, parent);

            panel.panel.style.width = `${copiedElement.width}px`;
            panel.panel.style.height = `${copiedElement.height}px`;

            if (isChild) {
                panel.panel.style.left = `${copiedElement.left}px`;
                panel.panel.style.top = `${copiedElement.top}px`;
            }

            ElementSharedFuncs.updateCenterCirclePosition(panel);

            GLOBAL_ELEMENT_MAP.set(id, panel);
            if (!panel) new Notification("Error pasting element", 5000, "error");

            processChildren(copiedElement, panel.panel);
        },
    ],
    [
        "draggable-collection_panel",
        (copiedElement: CopiedElementData, parent: HTMLElement, isChild: boolean = false): void => {
            const id: string = StringUtil.generateRandomString(15);
            const panel: DraggableCollectionPanel = new DraggableCollectionPanel(id, parent, copiedElement.collectionName ?? config.defaultCollectionName);

            panel.panel.style.width = `${copiedElement.width}px`;
            panel.panel.style.height = `${copiedElement.height}px`;

            if (isChild) {
                panel.panel.style.left = `${copiedElement.left}px`;
                panel.panel.style.top = `${copiedElement.top}px`;
            }

            ElementSharedFuncs.updateCenterCirclePosition(panel);

            GLOBAL_ELEMENT_MAP.set(id, panel);
            if (!panel) new Notification("Error pasting element", 5000, "error");

            processChildren(copiedElement, panel.panel);
        },
    ],
    [
        "draggable-canvas",
        (copiedElement: CopiedElementData, parent: HTMLElement, isChild: boolean = false): void => {
            const id: string = StringUtil.generateRandomString(15);

            const imageInfo = images.get(copiedElement.imageName);
            if (!imageInfo) {
                new Notification("Image name not found", 5000, "error");
                return undefined;
            }

            const canvas: DraggableCanvas = new DraggableCanvas(id, parent, imageInfo?.png!, copiedElement.imageName, imageInfo?.json);

            canvas.drawImage(copiedElement.width, copiedElement.height);

            if (isChild) {
                canvas.canvasHolder.style.left = `${copiedElement.left}px`;
                canvas.canvasHolder.style.top = `${copiedElement.top}px`;
            }

            ElementSharedFuncs.updateCenterCirclePosition(canvas);

            GLOBAL_ELEMENT_MAP.set(id, canvas);
            if (!canvas) new Notification("Error pasting element", 5000, "error");

            processChildren(copiedElement, canvas.canvasHolder);
        },
    ],
    [
        "draggable-button",
        (copiedElement: CopiedElementData, parent: HTMLElement, isChild: boolean = false): void => {
            const id: string = StringUtil.generateRandomString(15);

            const displayimageInfo = images.get(copiedElement.displayTexture);
            if (!displayimageInfo) {
                new Notification("Display-Image name not found", 5000, "warning");
            }

            const defaultimageInfo = images.get(copiedElement.defaultTexture);
            if (!defaultimageInfo) {
                new Notification("Default-Image name not found", 5000, "error");
                return;
            }

            const hoverimageInfo = images.get(copiedElement.hoverTexture);
            if (!hoverimageInfo) {
                new Notification("Hover-Image name not found", 5000, "error");
                return;
            }

            const pressedimageInfo = images.get(copiedElement.pressedTexture);
            if (!pressedimageInfo) {
                new Notification("Pressed-Image name not found", 5000, "error");
                return;
            }

            const button: DraggableButton = new DraggableButton(id, parent, {
                defaultTexture: copiedElement.defaultTexture,
                hoverTexture: copiedElement.hoverTexture,
                pressedTexture: copiedElement.pressedTexture,
                displayTexture: copiedElement.displayTexture,
                collectionIndex: copiedElement.collectionIndex,
                buttonText: copiedElement.buttonLabel.text,
            });

            button.drawImage(copiedElement.width, copiedElement.height);

            if (copiedElement.buttonLabel) {
                const displayLabel = button.displayText!;

                const labels: HTMLElement[] = [displayLabel.label, displayLabel.mirror, displayLabel.shadowLabel];

                for (const label of labels) {
                    label.style.fontFamily = copiedElement.buttonLabel.fontFamily;
                    label.style.fontSize = `${copiedElement.buttonLabel.fontScale}em`;
                    label.style.textAlign = copiedElement.buttonLabel.textAlign;
                }

                displayLabel.label.style.left = `${copiedElement.buttonLabel.left}px`;
                displayLabel.label.style.top = `${copiedElement.buttonLabel.top}px`;

                const offset = config.magicNumbers.labelToOffset(displayLabel.label);
                displayLabel.shadowLabel.style.left = `${StringUtil.cssDimToNumber(displayLabel.label.style.left) + displayLabel.shadowOffsetX + offset[0]}px`;

                displayLabel.shadowLabel.style.top = `${StringUtil.cssDimToNumber(displayLabel.label.style.top) + displayLabel.shadowOffsetY + offset[1]}px`;

                displayLabel.shadow(copiedElement.buttonLabel.hasShadow);
                displayLabel.updateSize(false);
            }

            if (copiedElement.displayCanvas) {
                console.log(copiedElement);
                button.setDisplayImage(copiedElement.displayTexture);
                const canvas: DraggableCanvas = button.displayCanvas!;

                canvas.drawImage(copiedElement.displayCanvas.width, copiedElement.displayCanvas.height);
                canvas.canvasHolder.style.left = `${copiedElement.displayCanvas.left}px`;
                canvas.canvasHolder.style.top = `${copiedElement.displayCanvas.top}px`;
            }

            const rect: DOMRect = button.container.getBoundingClientRect();

            button.button.style.left = `${rect.width / 2 - parseFloat(button.canvas.style.width) / 2}px`;
            button.button.style.top = `${rect.height / 2 - parseFloat(button.canvas.style.height) / 2}px`;

            if (isChild) {
                button.button.style.left = `${copiedElement.left}px`;
                button.button.style.top = `${copiedElement.top}px`;
            }

            ElementSharedFuncs.updateCenterCirclePosition(button);

            GLOBAL_ELEMENT_MAP.set(id, button);
            if (!button) new Notification("Error pasting element", 5000, "error");
        },
    ],
    [
        "draggable-scrolling_panel",
        (copiedElement: CopiedElementData, parent: HTMLElement, isChild: boolean = false): void => {
            const id: string = StringUtil.generateRandomString(15);
            const panel: DraggableScrollingPanel = new DraggableScrollingPanel(id, parent);

            panel.panel.style.width = `${copiedElement.width}px`;
            panel.panel.style.height = `${copiedElement.height}px`;
            panel.basePanel.style.width = panel.panel.style.width
            panel.basePanel.style.height = panel.panel.style.height

            if (isChild) {
                panel.basePanel.style.left = `${copiedElement.left}px`;
                panel.basePanel.style.top = `${copiedElement.top}px`;
            }

            panel.slider.updateHandle();

            GLOBAL_ELEMENT_MAP.set(id, panel);
            if (!panel) new Notification("Error pasting element", 5000, "error");

            processChildren(copiedElement, panel.panel);
        },
    ],
]);

export class Paster {
    static paste(): void {
        if (!copiedElementData) return;

        const parent = selectedElement ?? config.rootElement!;

        if (!Builder.isValidPath(parent)) {
            new Notification("Selected element cannot have children", 5000, "error");
            return;
        }

        const paste: (copiedElement: CopiedElementData, parent: HTMLElement) => void = pasteConversionMap.get(copiedElementData.type)!;

        paste(copiedElementData, parent!);
        new Notification("Element pasted", 5000, "notif");
    }
}
