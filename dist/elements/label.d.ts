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
    shadowLabel: HTMLDivElement;
    bindingsTextPrompt?: TextPrompt;
    focussed: boolean;
    isDragging: boolean;
    selected: boolean;
    deleteable: boolean;
    hasShadow: boolean;
    offsetX: number;
    offsetY: number;
    shadowOffsetX: number;
    shadowOffsetY: number;
    lastValue: string;
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
}
export {};
