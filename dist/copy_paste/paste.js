import { Builder, copiedElementData, GLOBAL_ELEMENT_MAP, images, selectedElement } from "../index.js";
import { DraggableLabel } from "../elements/label.js";
import { StringUtil } from "../util/stringUtil.js";
import { DraggablePanel } from "../elements/panel.js";
import { ElementSharedFuncs } from "../elements/sharedElement.js";
import { DraggableCollectionPanel } from "../elements/collectionPanel.js";
import { config } from "../CONFIG.js";
import { DraggableCanvas } from "../elements/canvas.js";
import { Notification } from "../ui/notifs/noficationMaker.js";
import { DraggableButton } from "../elements/button.js";
export const pasteConversionMap = new Map([
    [
        "draggable-label",
        (copiedElement, parent) => {
            const id = StringUtil.generateRandomString(15);
            const label = new DraggableLabel(id, parent, {
                text: copiedElement.text,
                textAlign: copiedElement.textAlign,
                fontScale: copiedElement.fontScale,
                fontColor: copiedElement.fontColor,
                includeTextPrompt: copiedElement.includeTextPrompt,
            });
            label.shadowLabel.style.fontFamily = copiedElement.fontFamily;
            label.mirror.style.fontFamily = copiedElement.fontFamily;
            label.label.style.fontFamily = copiedElement.fontFamily;
            label.label.dispatchEvent(new Event("input"));
            label.shadow(copiedElement.hasShadow);
            GLOBAL_ELEMENT_MAP.set(id, label);
            return label;
        },
    ],
    [
        "draggable-panel",
        (copiedElement, parent) => {
            const id = StringUtil.generateRandomString(15);
            const panel = new DraggablePanel(id, parent);
            panel.panel.style.width = `${copiedElement.width}px`;
            panel.panel.style.height = `${copiedElement.height}px`;
            ElementSharedFuncs.updateCenterCirclePosition(panel);
            GLOBAL_ELEMENT_MAP.set(id, panel);
            return panel;
        },
    ],
    [
        "draggable-collection_panel",
        (copiedElement, parent) => {
            const id = StringUtil.generateRandomString(15);
            const panel = new DraggableCollectionPanel(id, parent, copiedElement.collectionName ?? config.defaultCollectionName);
            panel.panel.style.width = `${copiedElement.width}px`;
            panel.panel.style.height = `${copiedElement.height}px`;
            ElementSharedFuncs.updateCenterCirclePosition(panel);
            GLOBAL_ELEMENT_MAP.set(id, panel);
            return panel;
        },
    ],
    [
        "draggable-canvas",
        (copiedElement, parent) => {
            const id = StringUtil.generateRandomString(15);
            const imageInfo = images.get(copiedElement.imageName);
            if (!imageInfo) {
                new Notification("Image name not found", 5000, "error");
                return undefined;
            }
            const panel = new DraggableCanvas(id, parent, imageInfo?.png, copiedElement.imageName, imageInfo?.json);
            panel.drawImage(copiedElement.width, copiedElement.height);
            ElementSharedFuncs.updateCenterCirclePosition(panel);
            GLOBAL_ELEMENT_MAP.set(id, panel);
            return panel;
        },
    ],
    [
        "draggable-button",
        (copiedElement, parent) => {
            const id = StringUtil.generateRandomString(15);
            const displayimageInfo = images.get(copiedElement.displayTexture);
            if (!displayimageInfo) {
                new Notification("Display-Image name not found", 5000, "warning");
            }
            const defaultimageInfo = images.get(copiedElement.defaultTexture);
            if (!defaultimageInfo) {
                new Notification("Default-Image name not found", 5000, "error");
                return undefined;
            }
            const hoverimageInfo = images.get(copiedElement.hoverTexture);
            if (!hoverimageInfo) {
                new Notification("Hover-Image name not found", 5000, "error");
                return undefined;
            }
            const pressedimageInfo = images.get(copiedElement.pressedTexture);
            if (!pressedimageInfo) {
                new Notification("Pressed-Image name not found", 5000, "error");
                return undefined;
            }
            const panel = new DraggableButton(id, parent, {
                defaultTexture: copiedElement.defaultTexture,
                hoverTexture: copiedElement.hoverTexture,
                pressedTexture: copiedElement.pressedTexture,
                displayTexture: copiedElement.displayTexture,
                collectionIndex: copiedElement.collectionIndex,
                buttonText: copiedElement.buttonLabel.text,
            });
            panel.drawImage(copiedElement.width, copiedElement.height);
            if (copiedElement.buttonLabel) {
                const displayLabel = panel.displayText;
                const labels = [displayLabel.label, displayLabel.mirror, displayLabel.shadowLabel];
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
                panel.setDisplayImage(copiedElement.displayTexture);
                const canvas = panel.displayCanvas;
                canvas.drawImage(copiedElement.displayCanvas.width, copiedElement.displayCanvas.height);
                canvas.canvasHolder.style.left = `${copiedElement.displayCanvas.left}px`;
                canvas.canvasHolder.style.top = `${copiedElement.displayCanvas.top}px`;
            }
            const rect = panel.container.getBoundingClientRect();
            panel.button.style.left = `${rect.width / 2 - parseFloat(panel.canvas.style.width) / 2}px`;
            panel.button.style.top = `${rect.height / 2 - parseFloat(panel.canvas.style.height) / 2}px`;
            ElementSharedFuncs.updateCenterCirclePosition(panel);
            GLOBAL_ELEMENT_MAP.set(id, panel);
            return panel;
        },
    ],
]);
export class Paster {
    static paste() {
        if (!selectedElement || !copiedElementData)
            return;
        if (!Builder.isValidPath(selectedElement)) {
            new Notification("Selected element cannot have children", 5000, "error");
            return;
        }
        const getClassElementFunc = pasteConversionMap.get(copiedElementData.type);
        const element = getClassElementFunc(copiedElementData, selectedElement);
        if (!element) {
            new Notification("Error pasting element", 5000, "error");
            return;
        }
    }
}
//# sourceMappingURL=paste.js.map