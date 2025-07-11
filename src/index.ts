import { Converter } from "./converter.js";
import { handlePackUpload } from "./files/openFiles.js";
import { DraggablePanel } from "./elements/panel.js";
import { DraggableCanvas } from "./elements/canvas.js";
import { NinesliceData } from "./nineslice.js";
import "./keyboard/arrowKeyElementMovement.js";
console.log("Script Loaded");


export function setSelectedElement(element: HTMLElement | undefined): void {
    selectedElement = element;
}
export let selectedElement: HTMLElement | undefined = undefined;

export const config = {
    boundary_constraints: false,
    arrow_key_move_amount: 1,
};


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

export function initProperties(): void {
    const properties: HTMLElement = document.getElementById("properties")!;

    let changingNode: Node | undefined;

    for (let node of Array.from(properties.childNodes)) {
        if (node instanceof HTMLInputElement) {
            node.addEventListener("input", function () {
                // Makes sure there is a selected element
                if (selectedElement) {
                    changingNode = node;

                    // Assigns the typed value the the style value
                    selectedElement.style[node.id.replace("properties_", "") as any] = node.value;
                }
            });

            // Resets the changingNode when the user leaves the text box
            node.addEventListener("blur", function () {
                // Makes sure there is a selected element
                if (selectedElement) {
                    changingNode = undefined;
                }
            });
        }
    }

    // Keeps the values of the selected element synced with the text box values
    setInterval(() => {
        for (let node of Array.from(properties.childNodes)) {
            if (node instanceof HTMLInputElement) {
                if (changingNode == node) continue;
                try {
                    node.value = (selectedElement?.style[node.id.replace("properties_", "") as keyof CSSStyleDeclaration] as string | undefined) ?? "None";
                } catch {
                    node.value = "None";
                }
            }
        }
    }, 50);
}

initProperties();

export var images: Map<string, { png?: ImageData; json?: NinesliceData }> = new Map();

export function updateImageDropdown(): void {
    const dropdown: HTMLElement = document.getElementById("addImageDropdown")!;

    // Removes all dropdown options
    dropdown.innerHTML = "";

    // Adds the dropdown options
    for (const [fileName, data] of images.entries()) {
        console.log(fileName);

        const fileNameText: HTMLDivElement = document.createElement("div");
        fileNameText.className = "dropdownContent";
        fileNameText.textContent = fileName;
        fileNameText.onclick = function () {
            Builder.addImage(fileName);
        };

        dropdown.appendChild(fileNameText);
    }
}

declare global {
    interface Window {
        Builder: typeof Builder;
        Converter: typeof Converter;
        handlePackUpload: () => void;
    }
}

window.handlePackUpload = handlePackUpload;
window.Builder = Builder;
window.Converter = Converter;
