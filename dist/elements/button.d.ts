import { ImageDataState } from "../index.js";
import { DraggableCanvas } from "./canvas.js";
import { DraggableLabel } from "./label.js";
export interface ButtonOptions {
    collectionIndex?: string;
    hoverTexture?: string;
    defaultTexture?: string;
    pressedTexture?: string;
    displayTexture?: string;
    buttonText?: string;
    [key: string]: any;
}
export declare class DraggableButton {
    imageDataDefault: ImageDataState;
    imageDataHover: ImageDataState;
    imageDataPressed: ImageDataState;
    displayCanvas?: DraggableCanvas;
    displayTexture?: string;
    displayText?: DraggableLabel;
    container: HTMLElement;
    outlineDiv: HTMLDivElement;
    button: HTMLElement;
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
    isHovering: boolean;
    isPressing: boolean;
    bindings: string;
    /**
     * @param {HTMLElement} container
     */
    constructor(ID: string, container: HTMLElement, buttonOptions?: ButtonOptions);
    initEvents(): void;
    select(e: MouseEvent): void;
    unSelect(_e?: MouseEvent): void;
    startDrag(e: MouseEvent): void;
    drag(e: MouseEvent): void;
    stopDrag(): void;
    startResize(e: MouseEvent): void;
    resize(e: MouseEvent): void;
    outlineResize(e: MouseEvent): void;
    stopResize(): void;
    startHover(): void;
    stopHover(): void;
    startPress(): void;
    stopPress(): void;
    getCurrentlyRenderedState(): ImageDataState;
    /**
     *
     * @param {number} width
     * @param {number} height
     */
    drawImage(width: number, height: number, imageDataState?: ImageDataState, _updateImage?: boolean): void;
    setDefaultImage(imageName: string): void;
    setHoverImage(imageName: string): void;
    setPressedImage(imageName: string): void;
    setDisplayImage(imageName: string): void;
    setDisplayText(text: string): void;
    getMainHTMLElement(): HTMLElement;
    delete(): void;
    grid(showGrid: boolean): void;
}
