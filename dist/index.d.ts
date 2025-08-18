import { Converter } from "./converter.js";
import { DraggablePanel } from "./elements/panel.js";
import { DraggableCanvas } from "./elements/canvas.js";
import { NinesliceData } from "./nineslice.js";
import { config } from "./CONFIG.js";
import { DraggableButton } from "./elements/button.js";
import { DraggableCollectionPanel } from "./elements/collectionPanel.js";
import { DraggableLabel } from "./elements/label.js";
import { DraggableScrollingPanel } from "./elements/scrollingPanel.js";
import "./ui/modals/settings.js";
export declare let mainJsonUiPanelElement: HTMLElement | undefined;
export declare function setSelectedElement(element: HTMLElement | undefined): void;
export declare let selectedElement: HTMLElement | undefined;
export declare const panelContainer: HTMLElement;
export declare let isInMainWindow: boolean;
export type GlobalElementMapValue = DraggableButton | DraggableCanvas | DraggablePanel | DraggableCollectionPanel | DraggableLabel | DraggableScrollingPanel;
export declare const GLOBAL_ELEMENT_MAP: Map<string, GlobalElementMapValue>;
export declare let copiedElement: HTMLElement | undefined;
export declare function setCopiedElement(element: HTMLElement | undefined): void;
export declare class Builder {
    static formatBindingsArea(): void;
    static downloadServerForm(type: "copy" | "download"): void;
    static handleUiTexturesUpload(): void;
    static generateAndCopyJsonUI(type: "copy" | "download"): void;
    static isValidPath(parent: HTMLElement): boolean;
    static addLabel(): void;
    static addPanel(): void;
    static addCollectionPanel(): void;
    static addCanvas(imageData: ImageData, imageName: string, nineSlice?: NinesliceData): void;
    static addButton(): Promise<void>;
    static addScrollingPanel(): void;
    static reset(): void;
    static deleteSelected(): void;
    static setSettingToggle(setting: keyof typeof config.settings, value: any): void;
    static addImage(imageName: string): void;
}
export interface ImageDataState {
    png?: ImageData;
    json?: NinesliceData;
}
export declare var images: Map<string, ImageDataState>;
declare global {
    interface Window {
        Builder: typeof Builder;
        Converter: typeof Converter;
        handlePackUpload: () => void;
    }
}
