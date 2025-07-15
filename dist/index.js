import { Converter } from "./converter.js";
import { handlePackUpload } from "./files/openFiles.js";
import { DraggablePanel } from "./elements/panel.js";
import { DraggableCanvas } from "./elements/canvas.js";
import { updatePropertiesArea } from "./ui/propertiesArea.js";
import { config } from "./CONFIG.js";
import { DraggableButton } from "./elements/button.js";
import './ui/modals/settings.js';
import { addButtonModal } from "./ui/modals/addButton.js";
import { DraggableCollectionPanel } from "./elements/collectionPanel.js";
import { StringUtil } from "./util/stringUtil.js";
import { DraggableLabel } from "./elements/label.js";
import { classToJsonUI } from "./converterTypes/HTMLClassToJonUITypes.js";
console.log("Script Loaded");
export function setSelectedElement(element) {
    selectedElement = element;
}
export let selectedElement = undefined;
export const panelContainer = document.getElementById("main_window");
export let isInMainWindow = false;
panelContainer.addEventListener('mouseenter', () => {
    isInMainWindow = true;
});
panelContainer.addEventListener('mouseleave', () => {
    isInMainWindow = false;
});
/*
 * Contains all the elements in the main window.
 * Each accessable element has a unique id.
 * The id is used to access the element.
 */
export const GLOBAL_ELEMENT_MAP = new Map();
export class Builder {
    static isValidPath(parent) {
        const convertionFunction = classToJsonUI.get(parent?.className);
        if (!convertionFunction)
            return false;
        // Gets the tree instructions
        const instructions = convertionFunction(parent, config.nameSpace).instructions;
        if (!instructions)
            return false;
        console.warn(`Is valid: ${instructions.ContinuePath}`);
        // If the tree was susposed to be stopped at this point
        return instructions.ContinuePath;
    }
    static addLabel() {
        if (selectedElement) {
            if (!this.isValidPath(selectedElement))
                return;
        }
        const id = StringUtil.generateRandomString(15);
        const panel = new DraggableLabel(id, selectedElement ?? panelContainer, { text: "Label" });
        GLOBAL_ELEMENT_MAP.set(id, panel);
    }
    static addPanel() {
        if (selectedElement) {
            if (!this.isValidPath(selectedElement))
                return;
        }
        const id = StringUtil.generateRandomString(15);
        const panel = new DraggablePanel(id, selectedElement ?? panelContainer);
        GLOBAL_ELEMENT_MAP.set(id, panel);
    }
    static addCollectionPanel() {
        if (selectedElement) {
            if (!this.isValidPath(selectedElement))
                return;
        }
        const id = StringUtil.generateRandomString(15);
        const collectionPanel = new DraggableCollectionPanel(id, selectedElement ?? panelContainer);
        GLOBAL_ELEMENT_MAP.set(id, collectionPanel);
    }
    static addCanvas(imageData, imageName, nineSlice) {
        if (selectedElement) {
            if (!this.isValidPath(selectedElement))
                return;
        }
        const id = StringUtil.generateRandomString(15);
        const canvas = new DraggableCanvas(id, selectedElement ?? panelContainer, imageData, imageName, nineSlice);
        GLOBAL_ELEMENT_MAP.set(id, canvas);
    }
    static async addButton() {
        if (selectedElement) {
            if (!this.isValidPath(selectedElement))
                return;
        }
        const id = StringUtil.generateRandomString(15);
        const formFields = await addButtonModal();
        const button = new DraggableButton(id, selectedElement ?? panelContainer, {
            defaultTexture: formFields.defaultTexture,
            hoverTexture: formFields.hoverTexture,
            pressedTexture: formFields.pressedTexture,
            collectionIndex: formFields.collectionIndex
        });
        GLOBAL_ELEMENT_MAP.set(id, button);
    }
    static reset() {
        selectedElement = undefined;
        panelContainer.innerHTML = `<img src="background.png" width="100%" height="100%" class="bg_image" id="bg_image">`;
        updatePropertiesArea();
    }
    static deleteSelected() {
        if (!selectedElement)
            return;
        selectedElement.remove();
        selectedElement = undefined;
    }
    static setSettingToggle(setting, value) {
        config.settings[setting].value = value;
        console.log(config.settings);
    }
    static addImage(imageName) {
        const imageData = images.get(imageName);
        // Checks if the image is there
        if (!imageData?.png)
            return;
        // Checks if the image is a nineslice
        this.addCanvas(imageData.png, imageName, imageData.json);
    }
}
;
export var images = new Map();
window.handlePackUpload = handlePackUpload;
window.Builder = Builder;
window.Converter = Converter;
//# sourceMappingURL=index.js.map