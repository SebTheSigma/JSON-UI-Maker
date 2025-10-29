import { Converter } from "./converter.js";
import { DraggablePanel } from "./elements/panel.js";
import { DraggableCanvas } from "./elements/canvas.js";
import { NinesliceData } from "./nineslice.js";
import { config } from "./CONFIG.js";
import { DraggableButton } from "./elements/button.js";
import { DraggableCollectionPanel } from "./elements/collectionPanel.js";
import { DraggableLabel } from "./elements/label.js";
import { DraggableScrollingPanel } from "./elements/scrollingPanel.js";
import { CopiedElementData } from "./copy_paste/copy.js";
import { ResizeableElements } from "./elements/sharedElement.js";
import "./ui/modals/settings.js";
import "./elements/groupedEventlisteners.js";
export declare let selectedElement: HTMLElement | undefined;
export declare function setSelectedElement(element: HTMLElement | undefined): void;
export declare let copiedElementData: CopiedElementData | undefined;
export declare function setCopiedElementData(data: CopiedElementData | undefined): void;
export declare let draggedElement: GlobalElementMapValue | undefined;
export declare function setDraggedElement(classElement: GlobalElementMapValue | undefined): void;
export declare let resizedElement: ResizeableElements | undefined;
export declare function setResizedElement(classElement: ResizeableElements | undefined): void;
export declare const panelContainer: HTMLElement;
export declare let isInMainWindow: boolean;
export type GlobalElementMapValue = DraggableButton | DraggableCanvas | DraggablePanel | DraggableCollectionPanel | DraggableLabel | DraggableScrollingPanel;
export declare const GLOBAL_ELEMENT_MAP: Map<string, GlobalElementMapValue>;
export declare class Builder {
    static uploadForm(): void;
    static formatBindingsArea(): void;
    static downloadServerForm(type: "copy" | "download"): void;
    static handleUiTexturesUpload(): void;
    static generateAndCopyJsonUI(type: "copy" | "download"): void;
    static isValidPath(parent: HTMLElement, childType?: "scrolling_panel" | "collection_panel" | "label" | "button" | "canvas" | "panel"): boolean;
    static addLabel(): void;
    static addPanel(): void;
    static addCollectionPanel(): void;
    static addCanvas(imageData: ImageData, imageName: string, nineSlice?: NinesliceData): void;
    static addButton(): Promise<void>;
    static addScrollingPanel(): void;
    static reset(): void;
    static deleteSelected(): void;
    static delete(id: string): void;
    static setSettingToggle(setting: keyof typeof config.settings, value: any): void;
    static addImage(imageName: string): void;
    static updateExplorer(): void;
    static texturePresetsModal(): void;
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
    }
}
