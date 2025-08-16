import { Converter } from "./converter.js";
import { FileUploader } from "./files/openFiles.js";
import { DraggablePanel } from "./elements/panel.js";
import { DraggableCanvas } from "./elements/canvas.js";
import { NinesliceData } from "./nineslice.js";
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
import "./ui/modals/settings.js";
console.log("Script Loaded");

BindingsArea.init();
console.log("Bindings-Area Loaded");

ScriptGenerator.init();
console.log("Script Generator Loaded");

document.addEventListener("DOMContentLoaded", async (e) => {
    const createFormOptions = await createFormModal();
    const title = createFormOptions.title!;

    config.title = title;
    config.nameSpace = `${StringUtil.generateRandomString(6)}namespace`;
});

export function setSelectedElement(element: HTMLElement | undefined): void {
    selectedElement = element;
    BindingsArea.updateBindingsEditor();
}

export let selectedElement: HTMLElement | undefined = undefined;

export const panelContainer: HTMLElement = document.getElementById("main_window")!;
export let isInMainWindow: boolean = false;

panelContainer.addEventListener("mouseenter", () => {
    isInMainWindow = true;
});

panelContainer.addEventListener("mouseleave", () => {
    isInMainWindow = false;
});

export type GlobalElementMapValue = DraggableButton | DraggableCanvas | DraggablePanel | DraggableCollectionPanel | DraggableLabel | DraggableScrollingPanel;

/*
 * Contains all the elements in the main window.
 * Each accessable element has a unique id.
 * The id is used to access the element.
 */
export const GLOBAL_ELEMENT_MAP: Map<string, GlobalElementMapValue> = new Map();

export let copiedElement: HTMLElement | undefined = undefined;
export function setCopiedElement(element: HTMLElement | undefined): void {
    copiedElement = element;
}

export class Builder {
    public static formatBindingsArea(): void {
        BindingsArea.format();
    }

    public static downloadServerForm(type: "copy" | "download"): void {
        const func = JSON_TYPES_GENERATOR.get("server_form");
        if (!func) return;

        if (type == "copy") {
            navigator.clipboard.writeText(func(config.nameSpace));
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

    public static handlePackUpload(): void {
        FileUploader.handlePackUpload();
    }

    public static generateAndCopyJsonUI(type: "copy" | "download"): void {
        const jsonUI = Converter.convertToJsonUi(panelContainer, 0);

        if (type == "copy") {
            navigator.clipboard.writeText(jsonUI);
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

    public static isValidPath(parent: HTMLElement): boolean {
        const convertionFunction = classToJsonUI.get(parent?.classList[0]!)!;
        if (!convertionFunction) return false;

        // Gets the tree instructions
        const instructions = convertionFunction(parent, config.nameSpace).instructions!;
        if (!instructions) return false;

        // If the tree was susposed to be stopped at this point
        return instructions.ContinuePath;
    }

    public static addLabel(): void {
        if (selectedElement) {
            if (!this.isValidPath(selectedElement)) return;
        }

        const id = StringUtil.generateRandomString(15);
        const label = new DraggableLabel(id, selectedElement ?? panelContainer, { text: "Label", includeTextPrompt: true });
        GLOBAL_ELEMENT_MAP.set(id, label);
    }

    public static addPanel(): void {
        if (selectedElement) {
            if (!this.isValidPath(selectedElement)) return;
        }

        const id = StringUtil.generateRandomString(15);
        const panel = new DraggablePanel(id, selectedElement ?? panelContainer);
        GLOBAL_ELEMENT_MAP.set(id, panel);
    }

    public static addCollectionPanel(): void {
        if (selectedElement) {
            if (!this.isValidPath(selectedElement)) return;
        }

        const id = StringUtil.generateRandomString(15);
        const collectionPanel = new DraggableCollectionPanel(id, selectedElement ?? panelContainer);
        GLOBAL_ELEMENT_MAP.set(id, collectionPanel);
    }

    public static addCanvas(imageData: ImageData, imageName: string, nineSlice?: NinesliceData): void {
        if (selectedElement) {
            if (!this.isValidPath(selectedElement)) return;
        }

        const id = StringUtil.generateRandomString(15);
        const canvas = new DraggableCanvas(id, selectedElement ?? panelContainer, imageData, imageName, nineSlice);
        GLOBAL_ELEMENT_MAP.set(id, canvas);
    }

    public static async addButton(): Promise<void> {
        if (selectedElement) {
            if (!this.isValidPath(selectedElement)) return;
        }

        const id = StringUtil.generateRandomString(15);

        const formFields = await addButtonModal();
        const button = new DraggableButton(id, selectedElement ?? panelContainer, {
            defaultTexture: formFields.defaultTexture,
            hoverTexture: formFields.hoverTexture,
            pressedTexture: formFields.pressedTexture,
            collectionIndex: formFields.collectionIndex,
        });

        GLOBAL_ELEMENT_MAP.set(id, button);
    }

    public static addScrollingPanel(): void {
        if (selectedElement) {
            if (!this.isValidPath(selectedElement)) return;
        }

        const id = StringUtil.generateRandomString(15);
        const panel = new DraggableScrollingPanel(id, selectedElement ?? panelContainer);
        GLOBAL_ELEMENT_MAP.set(id, panel);
    }

    public static reset(): void {

        if (selectedElement) {
            const selectedElementClass = GeneralUtil.elementToClassElement(selectedElement!);

            // Unselectes the element
            selectedElementClass?.delete();
        }

        panelContainer.innerHTML = `<img src="background.png" width="100%" height="100%" class="bg_image" id="bg_image">`;
        updatePropertiesArea();
    }

    public static deleteSelected(): void {
        if (!selectedElement) return;

        const element = GeneralUtil.elementToClassElement(selectedElement)!;
        const id = selectedElement.dataset.id!;

        element.delete();

        GLOBAL_ELEMENT_MAP.delete(id);
        updatePropertiesArea();
    }

    public static setSettingToggle(setting: keyof typeof config.settings, value: any): void {
        config.settings[setting]!.value = value;
    }

    public static addImage(imageName: string): void {
        const imageData: ReturnType<typeof images.get> = images.get(imageName);

        // Checks if the image is there
        if (!imageData?.png) return;

        // Checks if the image is a nineslice
        this.addCanvas(imageData.png, imageName, imageData.json);
    }
}

export interface ImageDataState {
    png?: ImageData;
    json?: NinesliceData;
}

export var images: Map<string, ImageDataState> = new Map();

declare global {
    interface Window {
        Builder: typeof Builder;
        Converter: typeof Converter;
        handlePackUpload: () => void;
    }
}

window.Builder = Builder;
