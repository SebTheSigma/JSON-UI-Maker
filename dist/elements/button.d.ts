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
    aspectRatio: number;
    centerCircle?: HTMLElement;
    container: HTMLElement;
    outlineDiv: HTMLDivElement;
    button: HTMLElement;
    canvas: HTMLCanvasElement;
    resizeHandle: HTMLDivElement;
    gridElement: HTMLElement;
    isDragging: boolean;
    isResizing: boolean;
    isHovering: boolean;
    isPressing: boolean;
    selected: boolean;
    deleteable: boolean;
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
     * Draws an image on the button canvas. If the image state is not specified, uses the default image state.
     * If _updateImage is true, scales the image to fill the button container while maintaining aspect ratio.
     *
     * @param {number} width - The width of the image to draw.
     * @param {number} height - The height of the image to draw.
     * @param {ImageDataState} [imageDataState=this.imageDataDefault] - The state of the image to draw.
     * @param {boolean} [_updateImage=false] - Whether to update the image to fill the button container, only needed if the image has changed.
     */
    drawImage(width: number, height: number, imageDataState?: ImageDataState, _updateImage?: boolean): void;
    setDefaultImage(imageName: string): void;
    setHoverImage(imageName: string): void;
    setPressedImage(imageName: string): void;
    setDisplayImage(imageName: string): void;
    setDisplayText(text: string): void;
    getMainHTMLElement(): HTMLElement;
    delete(): void;
    detach(): void;
    grid(showGrid: boolean): void;
    hide(): void;
    show(): void;
}
