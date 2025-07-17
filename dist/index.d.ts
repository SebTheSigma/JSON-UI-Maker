import { Converter } from "./converter.js";
import { DraggablePanel } from "./elements/panel.js";
import { DraggableCanvas } from "./elements/canvas.js";
import { NinesliceData } from "./nineslice.js";
import { config } from "./CONFIG.js";
import { DraggableButton } from "./elements/button.js";
import { DraggableCollectionPanel } from "./elements/collectionPanel.js";
import { DraggableLabel } from "./elements/label.js";
import './ui/modals/settings.js';
import './scripter/eval.js';
export declare function setSelectedElement(element: HTMLElement | undefined): void;
export declare let selectedElement: HTMLElement | undefined;
export declare const panelContainer: HTMLElement;
export declare let isInMainWindow: boolean;
export declare const GLOBAL_ELEMENT_MAP: Map<string, DraggableButton | DraggableCanvas | DraggableLabel | DraggablePanel | DraggableCollectionPanel>;
export declare class Builder {
    static isValidPath(parent: HTMLElement): boolean;
    static addLabel(): void;
    static addPanel(): void;
    static addCollectionPanel(): void;
    static addCanvas(imageData: ImageData, imageName: string, nineSlice?: NinesliceData): void;
    static addButton(): Promise<void>;
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
