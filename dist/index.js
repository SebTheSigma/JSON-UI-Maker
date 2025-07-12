import { Converter } from "./converter.js";
import { handlePackUpload } from "./files/openFiles.js";
import { DraggablePanel } from "./elements/panel.js";
import { DraggableCanvas } from "./elements/canvas.js";
import { initProperties } from "./ui/propertiesArea.js";
import { config } from "./CONFIG.js";
import { DraggableButton } from "./elements/button.js";
import './ui/modals/settings.js';
import { addButtonModal } from "./ui/modals/addButton.js";
console.log("Script Loaded");
export function setSelectedElement(element) {
    selectedElement = element;
}
export let selectedElement = undefined;
export const panelContainer = document.getElementById("main_window");
export class Builder {
    static addPanel() {
        new DraggablePanel(selectedElement ?? panelContainer);
    }
    static addCanvas(imageData, imageName, nineSlice) {
        new DraggableCanvas(selectedElement ?? panelContainer, imageData, imageName, nineSlice);
    }
    static async addButton() {
        const formFields = await addButtonModal();
        new DraggableButton(selectedElement ?? panelContainer, { defaultTexture: formFields.defaultTexture, hoverTexture: formFields.hoverTexture, pressedTexture: formFields.pressedTexture });
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
initProperties();
window.handlePackUpload = handlePackUpload;
window.Builder = Builder;
window.Converter = Converter;
//# sourceMappingURL=index.js.map