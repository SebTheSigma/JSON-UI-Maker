export declare class DraggablePanel {
    container: HTMLElement;
    panel: HTMLElement;
    resizeHandle?: HTMLElement;
    gridElement?: HTMLElement;
    centerCircle?: HTMLElement;
    isDragging: boolean;
    isResizing: boolean;
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
    constructor(ID: string, container: HTMLElement, interactable?: boolean);
    initEvents(): void;
    select(e: MouseEvent): void;
    unSelect(_e?: MouseEvent): void;
    startDrag(e: MouseEvent): void;
    drag(e: MouseEvent): void;
    stopDrag(): void;
    startResize(e: MouseEvent): void;
    resize(e: MouseEvent): void;
    stopResize(): void;
    getMainHTMLElement(): HTMLElement;
    delete(): void;
    grid(showGrid: boolean): void;
    detach(): void;
}
