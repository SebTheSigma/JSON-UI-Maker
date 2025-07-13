import { Converter } from "./converter.js";
import { handlePackUpload } from "./files/openFiles.js";
import { DraggablePanel } from "./elements/panel.js";
import { DraggableCanvas } from "./elements/canvas.js";
import { config } from "./CONFIG.js";
import { DraggableButton } from "./elements/button.js";
import './ui/modals/settings.js';
import { addButtonModal } from "./ui/modals/addButton.js";
import { DraggableCollectionPanel } from "./elements/collectionPanel.js";
import { StringUtil } from "./util/stringUtil.js";
console.log("Script Loaded");
export function setSelectedElement(element) {
    selectedElement = element;
}
export let selectedElement = undefined;
export const panelContainer = document.getElementById("main_window");
/*
 * Contains all the elements in the main window.
 * Each accessable element has a unique id.
 * The id is used to access the element.
 */
export const GLOBAL_ELEMENT_MAP = new Map();
export class Builder {
    static addPanel() {
        const id = StringUtil.generateRandomString(15);
        const panel = new DraggablePanel(id, selectedElement ?? panelContainer);
        GLOBAL_ELEMENT_MAP.set(id, panel);
    }
    static addCollectionPanel() {
        const id = StringUtil.generateRandomString(15);
        const collectionPanel = new DraggableCollectionPanel(id, selectedElement ?? panelContainer);
        GLOBAL_ELEMENT_MAP.set(id, collectionPanel);
    }
    static addCanvas(imageData, imageName, nineSlice) {
        const id = StringUtil.generateRandomString(15);
        const canvas = new DraggableCanvas(id, selectedElement ?? panelContainer, imageData, imageName, nineSlice);
        GLOBAL_ELEMENT_MAP.set(id, canvas);
    }
    static async addButton() {
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
    }
    static deleteSelected() {
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