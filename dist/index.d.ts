import { Converter } from "./converter.js";
import { NinesliceData } from "./nineslice.js";
import { config } from "./CONFIG.js";
import './ui/modals/settings.js';
export declare function setSelectedElement(element: HTMLElement | undefined): void;
export declare let selectedElement: HTMLElement | undefined;
export declare const panelContainer: HTMLElement;
export declare class Builder {
    static addPanel(): void;
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
