import { Converter } from "./converter.js";
import { FileUploader } from "./files/openFiles.js";
import { DraggablePanel } from "./elements/panel.js";
import { DraggableCanvas } from "./elements/canvas.js";
import { updatePropertiesArea } from "./ui/propertiesArea.js";
import { config } from "./CONFIG.js";
import { DraggableButton } from "./elements/button.js";
import { addButtonModal } from "./ui/modals/addButton.js";
import { DraggableCollectionPanel } from "./elements/collectionPanel.js";
import { StringUtil } from "./util/stringUtil.js";
import { DraggableLabel } from "./elements/label.js";
import { classToJsonUI } from "./converterTypes/HTMLClassToJonUITypes.js";
import { DraggableScrollingPanel } from "./elements/scrollingPanel.js";
import { GeneralUtil } from "./util/generalUtil.js";
import { JSON_TYPES_GENERATOR } from "./converterTypes/jsonUITypes.js";
import { BindingsArea } from "./scripter/bindings/bindingsArea.js";
import { ScriptGenerator } from "./scripter/generator.js";
import { createFormModal } from "./ui/modals/createForm.js";
import { Notification } from "./ui/notifs/noficationMaker.js";
import { FormUploader } from "./upload.js";
import "./ui/modals/settings.js";
import { initDefaultImages } from "./files/initDefaultImages.js";
console.log("Script Loaded");
initDefaultImages();
console.log("Image-Files Loaded");
BindingsArea.init();
console.log("Bindings-Area Loaded");
ScriptGenerator.init();
console.log("Script Generator Loaded");
export let mainJsonUiPanelElement = undefined;
document.addEventListener("DOMContentLoaded", async (e) => {
    const createFormOptions = await createFormModal();
    const title = createFormOptions.title;
    config.title = title;
    config.nameSpace = `${StringUtil.generateRandomString(6)}namespace`;
    const mainPanelInfo = constructMainPanel();
    mainJsonUiPanelElement = mainPanelInfo.mainPanel.getMainHTMLElement();
});
/**
 * Constructs the main panel, which is a non-interactive draggable panel.
 * The panel is added to the global element map.
 * @returns An object containing the id of the main panel and the main panel element itself.
 */
function constructMainPanel() {
    // A non interactable main panel
    const id = StringUtil.generateRandomString(15);
    const mainPanel = new DraggablePanel(id, panelContainer, false);
    mainPanel.deleteable = false;
    mainPanel.panel.style.width = 'calc(100% + 3px)';
    mainPanel.panel.style.height = 'calc(100% + 3px)';
    mainPanel.panel.style.top = '-3px';
    mainPanel.panel.style.left = '-3px';
    mainPanel.gridElement.style.setProperty("--grid-cols", '2');
    mainPanel.gridElement.style.setProperty("--grid-rows", '2');
    GLOBAL_ELEMENT_MAP.set(id, mainPanel);
    return { id, mainPanel };
}
export let selectedElement = undefined;
export function setSelectedElement(element) {
    selectedElement = element;
    BindingsArea.updateBindingsEditor();
}
export let copiedElementData = undefined;
export function setCopiedElementData(data) {
    copiedElementData = data;
}
export const panelContainer = document.getElementById("main_window");
export let isInMainWindow = false;
panelContainer.addEventListener("mouseenter", () => {
    isInMainWindow = true;
});
panelContainer.addEventListener("mouseleave", () => {
    isInMainWindow = false;
});
/*
 * Contains all the elements in the main window.
 * Each accessable element has a unique id.
 * The id is used to access the element.
 */
export const GLOBAL_ELEMENT_MAP = new Map();
export class Builder {
    static uploadForm() {
        console.log('Uploading form');
        const input = document.getElementById("form_importer");
        const file = input.files[0]; // ✅ first (and only) file
        if (!file)
            return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result;
            FormUploader.uploadForm(text);
            input.value = "";
        };
        reader.readAsText(file);
    }
    static formatBindingsArea() {
        BindingsArea.format();
    }
    static downloadServerForm(type) {
        const func = JSON_TYPES_GENERATOR.get("server_form");
        if (!func)
            return;
        if (type == "copy") {
            navigator.clipboard.writeText(func(config.nameSpace));
            new Notification('Server-Form Copied to Clipboard!');
            return;
        }
        const json = func(config.nameSpace);
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "server_form.json";
        a.click();
        URL.revokeObjectURL(url);
    }
    static handleUiTexturesUpload() {
        FileUploader.handleUiTexturesUpload();
    }
    static generateAndCopyJsonUI(type) {
        const jsonUI = Converter.convertToJsonUi(panelContainer, 0);
        if (type == "copy") {
            navigator.clipboard.writeText(jsonUI);
            new Notification('Json-UI Copied to Clipboard!');
            return;
        }
        const blob = new Blob([jsonUI], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${config.nameSpace}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
    static isValidPath(parent) {
        const convertionFunction = classToJsonUI.get(parent?.classList[0]);
        if (!convertionFunction)
            return false;
        // Gets the tree instructions
        const instructions = convertionFunction(parent, config.nameSpace).instructions;
        if (!instructions)
            return false;
        // If the tree was susposed to be stopped at this point
        return instructions.ContinuePath;
    }
    static addLabel() {
        if (selectedElement) {
            if (!this.isValidPath(selectedElement))
                return;
        }
        if (!mainJsonUiPanelElement)
            return;
        const id = StringUtil.generateRandomString(15);
        const label = new DraggableLabel(id, selectedElement ?? mainJsonUiPanelElement, { text: "Label", includeTextPrompt: true });
        GLOBAL_ELEMENT_MAP.set(id, label);
    }
    static addPanel() {
        if (selectedElement) {
            if (!this.isValidPath(selectedElement))
                return;
        }
        if (!mainJsonUiPanelElement)
            return;
        const id = StringUtil.generateRandomString(15);
        const panel = new DraggablePanel(id, selectedElement ?? mainJsonUiPanelElement);
        GLOBAL_ELEMENT_MAP.set(id, panel);
    }
    static addCollectionPanel() {
        if (selectedElement) {
            if (!this.isValidPath(selectedElement))
                return;
        }
        if (!mainJsonUiPanelElement)
            return;
        const id = StringUtil.generateRandomString(15);
        const collectionPanel = new DraggableCollectionPanel(id, selectedElement ?? mainJsonUiPanelElement);
        GLOBAL_ELEMENT_MAP.set(id, collectionPanel);
    }
    static addCanvas(imageData, imageName, nineSlice) {
        if (selectedElement) {
            if (!this.isValidPath(selectedElement))
                return;
        }
        if (!mainJsonUiPanelElement)
            return;
        const id = StringUtil.generateRandomString(15);
        const canvas = new DraggableCanvas(id, selectedElement ?? mainJsonUiPanelElement, imageData, imageName, nineSlice);
        GLOBAL_ELEMENT_MAP.set(id, canvas);
    }
    static async addButton() {
        if (selectedElement) {
            if (!this.isValidPath(selectedElement))
                return;
        }
        if (!mainJsonUiPanelElement)
            return;
        const id = StringUtil.generateRandomString(15);
        const formFields = await addButtonModal();
        if (!formFields.defaultTexture || !FileUploader.isFileUploaded(formFields.defaultTexture)) {
            new Notification("Please upload a texture for the default state!", 5000, "error");
            return;
        }
        if (!formFields.hoverTexture || !FileUploader.isFileUploaded(formFields.hoverTexture)) {
            new Notification("Please upload a texture for the hover state!", 5000, "error");
            return;
        }
        if (!formFields.pressedTexture || !FileUploader.isFileUploaded(formFields.pressedTexture)) {
            new Notification("Please upload a texture for the pressed state!", 5000, "error");
            return;
        }
        const button = new DraggableButton(id, selectedElement ?? mainJsonUiPanelElement, {
            defaultTexture: formFields.defaultTexture,
            hoverTexture: formFields.hoverTexture,
            pressedTexture: formFields.pressedTexture,
            collectionIndex: formFields.collectionIndex,
        });
        GLOBAL_ELEMENT_MAP.set(id, button);
    }
    static addScrollingPanel() {
        if (selectedElement) {
            if (!this.isValidPath(selectedElement))
                return;
        }
        if (!mainJsonUiPanelElement)
            return;
        const id = StringUtil.generateRandomString(15);
        const panel = new DraggableScrollingPanel(id, selectedElement ?? mainJsonUiPanelElement);
        GLOBAL_ELEMENT_MAP.set(id, panel);
    }
    static reset() {
        const elements = Array.from(GLOBAL_ELEMENT_MAP.values());
        // Removes events
        for (const element of elements) {
            if (element.getMainHTMLElement().dataset.id == selectedElement?.dataset.id)
                continue;
            element.detach();
        }
        if (selectedElement) {
            const selectedElementClass = GeneralUtil.elementToClassElement(selectedElement);
            // Unselectes the element
            selectedElementClass?.delete();
        }
        // Removes the elements that are attached to the body
        const bodyAttachedElements = document.getElementsByClassName("body-attched");
        for (const element of Array.from(bodyAttachedElements)) {
            element.remove();
        }
        GLOBAL_ELEMENT_MAP.clear();
        const bgImage = document.getElementById("bg_image");
        panelContainer.innerHTML = "";
        panelContainer.appendChild(bgImage);
        const mainPanelInfo = constructMainPanel();
        mainJsonUiPanelElement = mainPanelInfo.mainPanel.getMainHTMLElement();
        updatePropertiesArea();
    }
    static deleteSelected() {
        if (!selectedElement)
            return;
        const element = GeneralUtil.elementToClassElement(selectedElement);
        const id = selectedElement.dataset.id;
        element.delete();
        if (!element.deleteable)
            return;
        GLOBAL_ELEMENT_MAP.delete(id);
        updatePropertiesArea();
    }
    static setSettingToggle(setting, value) {
        config.settings[setting].value = value;
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
export var images = new Map();
window.Builder = Builder;
/*

TODO:
- Finsish grid locking
- Update pack uploader
- Grid and scrolling panels
- Scrolling panel offsets
- Upload button

BUGS:
- Nineslice doesnt dynamically size using the uiscale

*/ 
//# sourceMappingURL=index.js.map