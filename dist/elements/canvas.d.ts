import { NinesliceData } from "../nineslice.js";
export declare class DraggableCanvas {
    imageData: ImageData;
    nineSlice?: NinesliceData;
    container: HTMLElement;
    outlineDiv: HTMLDivElement;
    canvasHolder: HTMLDivElement;
    canvas: HTMLCanvasElement;
    resizeHandle: HTMLDivElement;
    gridElement: HTMLElement;
    centerCircle?: HTMLElement;
    aspectRatio: number;
    isDragging: boolean;
    isResizing: boolean;
    selected: boolean;
    deleteable: boolean;
    isEditable: boolean;
    offsetX: number;
    offsetY: number;
    resizeStartWidth?: number;
    resizeStartHeight?: number;
    resizeStartX?: number;
    resizeStartY?: number;
    resizeStartLeft?: number;
    resizeStartTop?: number;
    bindings: string;
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
    confirmResize(e: MouseEvent): void;
    resize(e: MouseEvent): void;
    stopResize(e?: MouseEvent, shouldResize?: boolean): void;
    /**
     *
     * @param {number} width
     * @param {number} height
     */
    drawImage(width: number, height: number, _updateImage?: boolean): void;
    changeImage(imageName: string): void;
    setParse(shouldParse: boolean): void;
    detatchAllEvents(): void;
    detach(): void;
    getMainHTMLElement(): HTMLElement;
    editable(isEditable: boolean): void;
    delete(): void;
    grid(showGrid: boolean): void;
    hide(): void;
    show(): void;
}
