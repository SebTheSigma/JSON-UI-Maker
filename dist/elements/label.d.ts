interface LabelOptions {
    text: string;
    textAlign?: 'left' | 'right' | 'center';
    fontScale?: number;
    fontColor?: [number, number, number];
}
export declare class DraggableLabel {
    container: HTMLElement;
    basePanel: HTMLElement;
    label: HTMLTextAreaElement;
    mirror: HTMLElement;
    isDragging: boolean;
    selected: boolean;
    offsetX: number;
    offsetY: number;
    hasShadow: boolean;
    shadowLabel: HTMLDivElement;
    shadowOffsetX: number;
    shadowOffsetY: number;
    /**
     * @param {HTMLElement} container
     */
    constructor(ID: string, container: HTMLElement, labelOptions?: LabelOptions);
    updateSize(updateProperties?: boolean): void;
    initEvents(): void;
    select(e: MouseEvent): void;
    unSelect(_e?: MouseEvent): void;
    startDrag(e: MouseEvent): void;
    drag(e: MouseEvent): void;
    stopDrag(): void;
    setParse(shouldParse: boolean): void;
    changeText(text: string): void;
    getMainHTMLElement(): HTMLElement;
    delete(): void;
    shadow(shouldShadow: boolean): void;
}
export {};
