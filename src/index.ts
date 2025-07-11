import { Converter } from "./converter.js";
import { handlePackUpload } from "./files/openFiles.js";
import { DraggablePanel } from "./elements/panel.js";
import { DraggableCanvas } from "./elements/canvas.js";
import { NinesliceData } from "./nineslice.js";
import { initProperties } from "./ui/propertiesArea.js";
import { config } from "./CONFIG.js";
console.log("Script Loaded");


export function setSelectedElement(element: HTMLElement | undefined): void {
    selectedElement = element;
}
export let selectedElement: HTMLElement | undefined = undefined;




export const panelContainer: HTMLElement = document.getElementById("main_window")!;

export class Builder {
    public static addPanel(): void {
        new DraggablePanel(selectedElement ?? panelContainer);
    }

    public static addCanvas(imageData: ImageData, imageName: string, nineSlice?: NinesliceData): void {
        new DraggableCanvas(selectedElement ?? panelContainer, imageData, imageName, nineSlice);
    }

    public static reset(): void {
        selectedElement = undefined;
        panelContainer.innerHTML = `<img src="background.png" width="100%" height="100%" class="bg_image" id="bg_image">`;
    }

    public static deleteSelected(): void {
        selectedElement!.remove();
        selectedElement = undefined;
    }

    public static setSettingToggle<K extends keyof typeof config>(setting: K, value: (typeof config)[K]): void {
        config[setting] = value;
        console.log(`Settings: ${JSON.stringify(config)}`, value, setting);
    }

    public static addImage(imageName: string): void {
        const imageData: ReturnType<typeof images.get> = images.get(imageName);

        // Checks if the image is there
        if (!imageData?.png) return;

        // Checks if the image is a nineslice
        this.addCanvas(imageData.png, imageName, imageData.json);
    }
}

export var images: Map<string, { png?: ImageData; json?: NinesliceData }> = new Map();

declare global {
    interface Window {
        Builder: typeof Builder;
        Converter: typeof Converter;
        handlePackUpload: () => void;
    }
}

initProperties();

window.handlePackUpload = handlePackUpload;
window.Builder = Builder;
window.Converter = Converter;
