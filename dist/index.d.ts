import { Converter } from "./converter.js";
/**
 * @type {KeyboardEvent}
 */
export declare let keyboardEvent: KeyboardEvent;
export declare let selectedElement: HTMLElement | undefined;
export declare const config: {
    boundary_constraints: boolean;
};
export declare class DraggablePanel {
    container: HTMLElement;
    panel: HTMLElement;
    resizeHandle: HTMLElement;
    isDragging: boolean;
    isResizing: boolean;
    selected: boolean;
    offsetX: number;
    offsetY: number;
    resizeStartWidth?: number;
    resizeStartHeight?: number;
    resizeStartX?: number;
    resizeStartY?: number;
    /**
     * @param {HTMLElement} container
     */
    constructor(container: HTMLElement);
    initEvents(): void;
    select(e: MouseEvent): void;
    unSelect(_e?: MouseEvent): void;
    startDrag(e: MouseEvent): void;
    drag(e: MouseEvent): void;
    stopDrag(): void;
    startResize(e: MouseEvent): void;
    resize(e: MouseEvent): void;
    stopResize(): void;
}
export interface NinesliceData {
    nineslice_size: [left: number, top: number, right: number, bottom: number];
    base_size: [width: number, height: number];
}
export declare class DraggableCanvas {
    imageData: ImageData;
    nineSlice?: NinesliceData;
    container: HTMLElement;
    canvasHolder: HTMLDivElement;
    canvas: HTMLCanvasElement;
    aspectRatio: number;
    resizeHandle: HTMLDivElement;
    isDragging: boolean;
    isResizing: boolean;
    selected: boolean;
    offsetX: number;
    offsetY: number;
    resizeStartWidth?: number;
    resizeStartHeight?: number;
    resizeStartX?: number;
    resizeStartY?: number;
    /**
     * @param {HTMLElement} container
     */
    constructor(container: HTMLElement, imageData: ImageData, imageName: string, nineSlice?: NinesliceData);
    initEvents(): void;
    select(e: MouseEvent): void;
    unSelect(_e?: MouseEvent): void;
    startDrag(e: MouseEvent): void;
    drag(e: MouseEvent): void;
    stopDrag(): void;
    startResize(e: MouseEvent): void;
    resize(e: MouseEvent): void;
    stopResize(): void;
    /**
     *
     * @param {number} width
     * @param {number} height
     */
    drawImage(width: number, height: number): void;
}
export declare class Nineslice {
    static ninesliceResize({ nineslice_size, base_size }: NinesliceData, pixelArray: Uint8ClampedArray<ArrayBufferLike>, newWidth: number, newHeight: number): Uint8ClampedArray<ArrayBuffer>;
}
export declare const panelContainer: HTMLElement | null;
export declare class Builder {
    static addPanel(): void;
    static addCanvas(imageData: ImageData, nineSlice?: NinesliceData, imageName: string): void;
    static reset(): void;
    static deleteSelected(): void;
    static changeSettingToggle(setting: keyof typeof config): void;
    static addImage(imageName: string): void;
}
export declare function initProperties(): void;
export declare var images: Map<string, {
    png?: ImageData;
    json?: NinesliceData;
}>;
export declare function updateImageDropdown(): void;
export declare function handleImageUpload(): void;
declare global {
    interface Window {
        Builder: typeof Builder;
        Converter: typeof Converter;
        handleImageUpload: () => void;
    }
}
