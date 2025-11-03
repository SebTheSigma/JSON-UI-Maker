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
import { Notification } from "./ui/notifs/noficationMaker.js";
import { CopiedElementData } from "./copy_paste/copy.js";
import { FormUploader } from "./upload.js";
import { initDefaultImages } from "./files/initDefaultImages.js";
import { ExplorerController } from "./ui/explorer/explorerController.js";
import { ResizeableElements } from "./elements/sharedElement.js";
import { loadTexturePresetsModal } from "./ui/modals/loadTexturePresets.js";
import { helpModal } from "./ui/modals/helpMenu.js";
import { chooseImageModal } from "./ui/modals/chooseImage.js";
import "./ui/modals/settings.js";
import { authModal } from "./ui/modals/authModal.js";
import { uploadPresetModal } from "./ui/modals/uploadPresetModal.js";
import { presetManagementModal } from "./ui/modals/presetManagementModal.js";
import { authManager } from "./auth.js";
import { presetManager } from "./presetManager.js";
import { loadSqlJs } from "./database.js";
import { dbManager } from "./database.js";
import "./elements/groupedEventlisteners.js";
import "./ui/scale.js";
import { undoRedoManager } from "./keyboard/undoRedo.js";

console.log("Script Loaded");

initDefaultImages();
console.log("Image-Files Loaded");

BindingsArea.init();
console.log("Bindings-Area Loaded");

ScriptGenerator.init();
console.log("Script Generator Loaded");

document.addEventListener("DOMContentLoaded", async (e) => {
    // Initialize database and auth
    try {
        await loadSqlJs();
        await dbManager.init();
        authManager.init();

        // Make managers globally available
        (window as any).dbManager = dbManager;
        (window as any).authManager = authManager;
        (window as any).presetManager = presetManager;

        console.log("Database and Auth initialized");
    } catch (error) {
        console.error("Failed to initialize database:", error);
    }

    // Initialize modals
    authModal.init();
    uploadPresetModal.init();
    presetManagementModal.init();

    const createFormOptions = await createFormModal();
    const title_flag = createFormOptions.title_flag!;

    config.title_flag = title_flag;
    config.nameSpace = `${StringUtil.generateRandomString(6)}namespace`;

    const mainPanelInfo = constructMainPanel();

    config.rootElement = mainPanelInfo.mainPanel.getMainHTMLElement()!;

    // Update auth UI after everything is loaded
    setTimeout(() => {
        Builder.updateAuthUI();
    }, 100);

    // Make images map globally available
    (window as any).images = images;
    
    // Load any saved assets from localStorage
    await loadSavedAssets();
});

/**
 * Loads assets that were saved to localStorage (from preset uploads, etc.)
 */
async function loadSavedAssets(): Promise<void> {
    try {
        console.log('Loading saved assets from localStorage...');
        const assetKeys = Object.keys(localStorage).filter(key => key.startsWith('asset_') && (key.endsWith('_png') || key.endsWith('_json')));
        
        const loadedAssets: { [key: string]: { png?: ImageData; json?: any } } = {};
        
        for (const key of assetKeys) {
            const assetName = key.replace('asset_', '').replace(/_png|_json$/, '');
            const isPng = key.endsWith('_png');
            const isJson = key.endsWith('_json');
            
            if (!loadedAssets[assetName]) {
                loadedAssets[assetName] = {};
            }
            
            try {
                const storedData = JSON.parse(localStorage.getItem(key) || '{}');
                
                if (isPng && storedData.base64) {
                    // Create ImageData from base64
                    const imageData = await createImageDataFromBase64(storedData.base64);
                    loadedAssets[assetName].png = imageData;
                    console.log(`Loaded PNG asset: ${assetName}`);
                } else if (isJson && storedData.jsonContent) {
                    loadedAssets[assetName].json = storedData.jsonContent;
                    console.log(`Loaded JSON asset: ${assetName}`);
                }
            } catch (error) {
                console.error(`Error loading asset ${key}:`, error);
            }
        }
        
        // Add all loaded assets to the images map
        let loadedCount = 0;
        for (const [assetName, data] of Object.entries(loadedAssets)) {
            if (data.png || data.json) {
                images.set(assetName, data);
                loadedCount++;
            }
        }
        
        console.log(`Successfully loaded ${loadedCount} saved assets`);
        
        // Refresh the UI if needed
        if ((window as any).Builder) {
            (window as any).Builder.updateExplorer();
        }
    } catch (error) {
        console.error('Error loading saved assets:', error);
    }
}

/**
 * Helper function to create ImageData from base64
 */
async function createImageDataFromBase64(base64Data: string): Promise<ImageData> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d')!;
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(0, 0, img.width, img.height);
            resolve(imageData);
        };
        img.onerror = reject;
        
        // Ensure the data has proper data URL format
        let imageSrc = base64Data;
        if (!base64Data.startsWith('data:image/')) {
            imageSrc = `data:image/png;base64,${base64Data}`;
        }
        
        img.src = imageSrc;
    });
}

/**
 * Constructs the main panel, which is a non-interactive draggable panel.
 * The panel is added to the global element map.
 * @returns An object containing the id of the main panel and the main panel element itself.
 */
function constructMainPanel(): { id: string; mainPanel: DraggablePanel } {
    // A non interactable main panel
    const id = StringUtil.generateRandomString(15);
    const mainPanel = new DraggablePanel(id, panelContainer, false);
    mainPanel.deleteable = false;

    const parent = mainPanel.panel.parentElement!;
    const parentRect = parent.getBoundingClientRect();

    mainPanel.panel.style.width = `${parentRect.width + 3}px`;
    mainPanel.panel.style.height = `${parentRect.height + 3}px`;

    mainPanel.panel.style.left = `-1.5px`;
    mainPanel.panel.style.top = `-1.5px`;

    mainPanel.gridElement!.style.setProperty("--grid-cols", "2");
    mainPanel.gridElement!.style.setProperty("--grid-rows", "2");

    GLOBAL_ELEMENT_MAP.set(id, mainPanel);

    return { id, mainPanel };
}

export let selectedElement: HTMLElement | undefined = undefined;
export function setSelectedElement(element: HTMLElement | undefined): void {
    selectedElement = element;
    BindingsArea.updateBindingsEditor();
    ExplorerController.selectedElementUpdate();
}

export let copiedElementData: CopiedElementData | undefined = undefined;
export function setCopiedElementData(data: CopiedElementData | undefined): void {
    copiedElementData = data;
    new Notification("Copied Element", 2000, "notif");
}

export let draggedElement: GlobalElementMapValue | undefined = undefined;
export function setDraggedElement(classElement: GlobalElementMapValue | undefined): void {
    draggedElement = classElement;
}

export let resizedElement: ResizeableElements | undefined = undefined;
export function setResizedElement(classElement: ResizeableElements | undefined): void {
    resizedElement = classElement;
}

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
export let GLOBAL_FILE_SYSTEM: any = {};

export function setFileSystem(fs: any): void {
    GLOBAL_FILE_SYSTEM = fs;
}

export class Builder {
    public static uploadForm(): void {
        console.log("Uploading form");
        const input = document.getElementById("form_importer") as HTMLInputElement;
        const file = input.files![0]; // ✅ first (and only) file

        if (!file) return;

        const reader: FileReader = new FileReader();

        reader.onload = (event) => {
            const text = event.target?.result as string;
            FormUploader.uploadForm(text);
            Builder.updateExplorer();
            undoRedoManager.clear(); // Clear undo/redo when loading new form

            input.value = "";
        };

        reader.readAsText(file);
    }

    public static formatBindingsArea(): void {
        BindingsArea.format();
    }

    public static downloadServerForm(type: "copy" | "download"): void {
        const func = JSON_TYPES_GENERATOR.get("server_form");
        if (!func) return;

        if (type == "copy") {
            navigator.clipboard.writeText(func(config.nameSpace));
            new Notification("Server-Form Copied to Clipboard!");
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

    public static handleUiTexturesUpload(): void {
        FileUploader.handleUiTexturesUpload();
    }

    public static generateAndCopyJsonUI(type: "copy" | "download"): void {
        const jsonUI = Converter.convertToJsonUi(panelContainer, 0);

        if (type == "copy") {
            navigator.clipboard.writeText(jsonUI);
            new Notification("Json-UI Copied to Clipboard!");
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

    public static isValidPath(parent: HTMLElement, childType?: "scrolling_panel" | "collection_panel" | "label" | "button" | "canvas" | "panel"): boolean {
        const convertionFunction = classToJsonUI.get(parent?.classList[0]!)!;
        if (!convertionFunction) return false;

        // Gets the tree instructions
        const instructions = convertionFunction(parent, config.nameSpace).instructions!;
        if (!instructions) return false;

        if (childType == "scrolling_panel") {
            // If the tree was susposed to be stopped at this point
            let currentParent = parent;
            let isScrollingContent = false;

            while (currentParent.dataset.id != config.rootElement!.dataset.id) {
                if (currentParent.classList.contains("draggable-scrolling_panel")) isScrollingContent = true;
                currentParent = currentParent.parentElement!;
            }

            if (isScrollingContent) {
                new Notification("Cannot stack scrolling panels", 2000, "warning");
                return false;
            }
        }

        return instructions.ContinuePath;
    }

    public static addLabel(): void {
        if (selectedElement) {
            if (!this.isValidPath(selectedElement, "label")) return;
        }

        if (!config.rootElement!) return;

        const id = StringUtil.generateRandomString(15);
        const label = new DraggableLabel(id, selectedElement ?? config.rootElement!, { text: "Label", includeTextPrompt: true });
        GLOBAL_ELEMENT_MAP.set(id, label);

        // Record add operation for undo/redo
        undoRedoManager.push({
            type: 'add',
            elementId: id,
            elementData: {
                type: 'draggable-label',
                id: id,
                text: "Label",
                left: 0,
                top: 0,
                width: 100,
                height: 30
            }
        });
    }

    public static addPanel(): void {
        if (selectedElement) {
            if (!this.isValidPath(selectedElement, "panel")) return;
        }

        if (!config.rootElement!) return;

        const id = StringUtil.generateRandomString(15);
        const panel = new DraggablePanel(id, selectedElement ?? config.rootElement!);
        GLOBAL_ELEMENT_MAP.set(id, panel);

        // Record add operation for undo/redo
        undoRedoManager.push({
            type: 'add',
            elementId: id,
            elementData: {
                type: 'draggable-panel',
                id: id,
                left: 0,
                top: 0,
                width: 100,
                height: 100
            }
        });
    }

    public static addCollectionPanel(): void {
        if (selectedElement) {
            if (!this.isValidPath(selectedElement, "collection_panel")) return;
        }

        if (!config.rootElement!) return;

        const id = StringUtil.generateRandomString(15);
        const collectionPanel = new DraggableCollectionPanel(id, selectedElement ?? config.rootElement!);
        GLOBAL_ELEMENT_MAP.set(id, collectionPanel);

        // Record add operation for undo/redo
        undoRedoManager.push({
            type: 'add',
            elementId: id,
            elementData: {
                type: 'draggable-collection_panel',
                id: id,
                left: 0,
                top: 0,
                width: 100,
                height: 100
            }
        });
    }

    public static addCanvas(imageData: ImageData, imagePath: string, nineSlice?: NinesliceData): void {
        if (selectedElement) {
            if (!this.isValidPath(selectedElement, "canvas")) return;
        }

        if (!config.rootElement!) return;

        const id = StringUtil.generateRandomString(15);
        const canvas = new DraggableCanvas(id, selectedElement ?? config.rootElement!, imageData, imagePath, nineSlice);
        GLOBAL_ELEMENT_MAP.set(id, canvas);

        // Record add operation for undo/redo
        undoRedoManager.push({
            type: 'add',
            elementId: id,
            elementData: {
                type: 'draggable-canvas',
                id: id,
                left: 0,
                top: 0,
                width: 100,
                height: 100,
                imagePath: imagePath
            }
        });
    }

    public static async addButton(): Promise<void> {
        if (selectedElement) {
            if (!this.isValidPath(selectedElement, "button")) return;
        }

        if (!config.rootElement!) return;

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

        const button = new DraggableButton(id, selectedElement ?? config.rootElement!, {
            defaultTexture: formFields.defaultTexture,
            hoverTexture: formFields.hoverTexture,
            pressedTexture: formFields.pressedTexture,
            collectionIndex: formFields.collectionIndex,
        });

        GLOBAL_ELEMENT_MAP.set(id, button);

        // Record add operation for undo/redo
        undoRedoManager.push({
            type: 'add',
            elementId: id,
            elementData: {
                type: 'draggable-button',
                id: id,
                left: 0,
                top: 0,
                width: 100,
                height: 30,
                defaultTexture: formFields.defaultTexture,
                hoverTexture: formFields.hoverTexture,
                pressedTexture: formFields.pressedTexture,
                collectionIndex: formFields.collectionIndex
            }
        });
    }

    public static addScrollingPanel(): void {
        if (selectedElement) {
            if (!this.isValidPath(selectedElement, "scrolling_panel")) return;
        }

        if (!config.rootElement!) return;

        const id = StringUtil.generateRandomString(15);
        const panel = new DraggableScrollingPanel(id, selectedElement ?? config.rootElement!);
        GLOBAL_ELEMENT_MAP.set(id, panel);

        // Record add operation for undo/redo
        undoRedoManager.push({
            type: 'add',
            elementId: id,
            elementData: {
                type: 'draggable-scrolling_panel',
                id: id,
                left: 0,
                top: 0,
                width: 100,
                height: 100
            }
        });
    }

    public static reset(): void {
        const elements: GlobalElementMapValue[] = Array.from(GLOBAL_ELEMENT_MAP.values());

        // Removes events
        for (const element of elements) {
            if (element.getMainHTMLElement().dataset.id == selectedElement?.dataset.id) continue;

            element.detach();
        }

        if (selectedElement) {
            const selectedElementClass = GeneralUtil.elementToClassElement(selectedElement!);

            // Unselectes the element
            selectedElementClass?.delete();
        }

        // Removes the elements that are attached to the body
        const bodyAttachedElements = document.getElementsByClassName("body-attched");
        for (const element of Array.from(bodyAttachedElements)) {
            element.remove();
        }

        GLOBAL_ELEMENT_MAP.clear();

        const bgImage = document.getElementById("bg_image")!;
        panelContainer.innerHTML = "";
        panelContainer.appendChild(bgImage);

        const mainPanelInfo = constructMainPanel();
        config.rootElement = mainPanelInfo.mainPanel.getMainHTMLElement();

        updatePropertiesArea();
        Builder.updateExplorer();

        // Clear undo/redo history on reset
        undoRedoManager.clear();
    }

    public static deleteSelected(): void {
        if (!selectedElement) return;

        Builder.delete(selectedElement.dataset.id!);
    }

    public static delete(id: string): void {
        const element = GeneralUtil.idToClassElement(id);
        if (!element || !element.deleteable) return;

        // Record delete operation for undo/redo
        const mainElement = element.getMainHTMLElement();
        const elementData = {
            type: mainElement.classList[0],
            id: id,
            left: StringUtil.cssDimToNumber(mainElement.style.left),
            top: StringUtil.cssDimToNumber(mainElement.style.top),
            width: StringUtil.cssDimToNumber(mainElement.style.width),
            height: StringUtil.cssDimToNumber(mainElement.style.height),
            // Add more properties based on element type as needed
        };

        undoRedoManager.push({
            type: 'delete',
            elementId: id,
            elementData: elementData
        });

        element.delete();

        GLOBAL_ELEMENT_MAP.delete(id);
        updatePropertiesArea();
        Builder.updateExplorer();
    }

    public static setSettingToggle(setting: keyof typeof config.settings, value: any): void {
        config.settings[setting]!.value = value;
    }

    public static updateExplorer(): void {
        ExplorerController.updateExplorer();
    }

    public static texturePresetsModal(): void {
        loadTexturePresetsModal();
    }

    public static openHelpMenu(): void {
        helpModal();
    }

    public static openAuthModal(signup: boolean = false): void {
        authModal.show(signup);
    }

    public static openUploadPresetModal(): void {
        const user = authManager.getCurrentUser();
        if (!user) {
            new Notification("You must be signed in to upload presets", 3000, "warning");
            authModal.show(false);
            return;
        }
        uploadPresetModal.show();
    }

    public static openPresetManagementModal(): void {
        const user = authManager.getCurrentUser();
        if (!user) {
            new Notification("You must be signed in to manage presets", 3000, "warning");
            authModal.show(false);
            return;
        }
        presetManagementModal.show();
    }

    public static updateAuthUI(): void {
        // Update UI elements based on auth state
        const user = authManager.getCurrentUser();
        const authUserDisplay = document.getElementById('authUserDisplay');
        const authSignInBtn = document.getElementById('authSignInBtn');
        const authSignUpBtn = document.getElementById('authSignUpBtn');
        const authLogoutBtn = document.getElementById('authLogoutBtn');
        const presetUploadBtn = document.getElementById('presetUploadBtn');
        const presetManagementBtn = document.getElementById('presetManagementBtn');

        if (user) {
            authUserDisplay!.textContent = `Signed in as: ${user.username}`;
            authSignInBtn!.style.display = 'none';
            authSignUpBtn!.style.display = 'none';
            authLogoutBtn!.style.display = 'inline-block';
            
            if (presetUploadBtn) {
                presetUploadBtn.style.display = 'block';
            }
            if (presetManagementBtn) {
                presetManagementBtn.style.display = 'block';
            }
        } else {
            authUserDisplay!.textContent = 'Not signed in';
            authSignInBtn!.style.display = 'inline-block';
            authSignUpBtn!.style.display = 'inline-block';
            authLogoutBtn!.style.display = 'none';
            
            if (presetUploadBtn) {
                presetUploadBtn.style.display = 'none';
            }
            if (presetManagementBtn) {
                presetManagementBtn.style.display = 'none';
            }
        }
    }

    public static refreshPresetTextures(): void {
        // Refresh the texture presets modal with user presets
        const modal = document.getElementById('modalLoadTexturePresets');
        if (modal && modal.style.display === 'block') {
            // If the modal is open, close and reopen it to refresh the content
            modal.style.display = 'none';
            setTimeout(() => {
                modal.style.display = 'block';
            }, 100);
        }
        
        // Also refresh the preset management modal if it's open
        if ((window as any).presetManagementModal) {
            (window as any).presetManagementModal.refreshPresets();
        }
    }

    public static logout(): void {
        authManager.logout();
        this.updateAuthUI();
        new Notification("Signed out successfully", 2000, "notif");
    }

    public static async openAddImageMenu(): Promise<void> {
        const filePath: string = await chooseImageModal();

        console.warn(filePath, images);
        const imageInfo: ImageDataState = images.get(filePath)!;

        if (imageInfo) {
            // Handle both PNG and JSON only images
            if (imageInfo.png) {
                this.addCanvas(imageInfo.png!, filePath, imageInfo.json!);
            } else if (imageInfo.json) {
                // JSON only - create a basic canvas with just the nineslice data
                // For now, we'll create a small transparent canvas
                const canvas = document.createElement('canvas');
                canvas.width = 32;
                canvas.height = 32;
                const ctx = canvas.getContext('2d')!;
                const imageData = ctx.createImageData(32, 32);
                // Fill with transparent
                for (let i = 0; i < imageData.data.length; i += 4) {
                    imageData.data[i] = 0;     // R
                    imageData.data[i + 1] = 0; // G
                    imageData.data[i + 2] = 0; // B
                    imageData.data[i + 3] = 0; // A
                }
                this.addCanvas(imageData, filePath, imageInfo.json);
            }
        } else {
            console.log('Image not found in images map:', filePath);
            console.log('Available images:', Array.from(images.keys()));
        }
    }

    public static undo(): void {
        undoRedoManager.undo();
    }

    public static redo(): void {
        undoRedoManager.redo();
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
    }
}

window.Builder = Builder;
