import { TextPrompt } from "../ui/textPrompt.js";
interface LabelOptions {
    text: string;
    textAlign?: "left" | "right" | "center";
    fontScale?: number;
    fontColor?: [number, number, number];
    includeTextPrompt?: boolean;
}
export declare class DraggableLabel {
    container: HTMLElement;
    label: HTMLTextAreaElement;
    mirror: HTMLElement;
    bindingsTextPrompt: TextPrompt | undefined;
    focussed: boolean;
    isDragging: boolean;
    selected: boolean;
    offsetX: number;
    offsetY: number;
    hasShadow: boolean;
    shadowLabel: HTMLDivElement;
    lastValue: string;
    shadowOffsetX: number;
    shadowOffsetY: number;
    bindings: string;
    /**
     * @param {HTMLElement} container
     */
    constructor(ID: string, container: HTMLElement, labelOptions?: LabelOptions);
    updateSize(updateProperties?: boolean): void;
    initEvents(): void;
    handleKeyboardInput(e: KeyboardEvent): void;
    filterSourcePropertyNames(): void;
    /**
     * Sets the string as the property name of the label.
     *
     * @param {string} propName - The property name to set.
     * @return {void} This function does not return anything.
     */
    setStringAsPropName(propName: string): void;
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
    grid(showGrid: boolean): void;
}
export {};
