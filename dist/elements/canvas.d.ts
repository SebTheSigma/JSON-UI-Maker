import { NinesliceData } from "../nineslice.js";
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
    constructor(ID: string, container: HTMLElement, imageData: ImageData, imageName: string, nineSlice?: NinesliceData);
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
    changeImage(imageName: string): void;
    setParse(shouldParse: boolean): void;
}
