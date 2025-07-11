import { Converter } from "./converter.js";
import { NinesliceData } from "./nineslice.js";
import { config } from "./CONFIG.js";
export declare function setSelectedElement(element: HTMLElement | undefined): void;
export declare let selectedElement: HTMLElement | undefined;
export declare const panelContainer: HTMLElement;
export declare class Builder {
    static addPanel(): void;
    static addCanvas(imageData: ImageData, imageName: string, nineSlice?: NinesliceData): void;
    static reset(): void;
    static deleteSelected(): void;
    static setSettingToggle<K extends keyof typeof config>(setting: K, value: (typeof config)[K]): void;
    static addImage(imageName: string): void;
}
export declare var images: Map<string, {
    png?: ImageData;
    json?: NinesliceData;
}>;
declare global {
    interface Window {
        Builder: typeof Builder;
        Converter: typeof Converter;
        handlePackUpload: () => void;
    }
}
