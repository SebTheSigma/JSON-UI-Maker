/**
 * @type {KeyboardEvent}
 */
declare let keyboardEvent: KeyboardEvent;
declare let selectedElement: HTMLElement | undefined;
declare const config: {
    boundary_constraints: boolean;
};
declare class DraggablePanel {
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
interface NinesliceData {
    nineslice_size: [left: number, top: number, right: number, bottom: number];
    base_size: [width: number, height: number];
}
declare class DraggableCanvas {
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
    constructor(container: HTMLElement, imageData: ImageData, nineSlice?: NinesliceData);
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
declare class Nineslice {
    static ninesliceResize({ nineslice_size, base_size }: NinesliceData, pixelArray: Uint8ClampedArray<ArrayBufferLike>, newWidth: number, newHeight: number): Uint8ClampedArray<ArrayBuffer>;
}
declare const panelContainer: HTMLElement | null;
declare class Builder {
    static addPanel(): void;
    static addCanvas(imageData: ImageData, nineSlice?: NinesliceData): void;
    static reset(): void;
    static deleteSelected(): void;
    static changeSettingToggle(setting: keyof typeof config): void;
    static addImage(imageName: string): void;
}
declare function initProperties(): void;
declare var images: Map<string, {
    png?: ImageData;
    json?: NinesliceData;
}>;
declare function updateImageDropdown(): void;
declare function handleImageUpload(): void;
