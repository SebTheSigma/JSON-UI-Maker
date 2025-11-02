import { GlobalElementMapValue } from "../index.js";
import { Binding } from "../scripter/bindings/types.js";
export declare class GeneralUtil {
    static getElementDepth(el: HTMLElement | null, stopsAtElement?: HTMLElement | null): number;
    static elementToClassElement(element: HTMLElement): GlobalElementMapValue | undefined;
    static idToClassElement(id: string): GlobalElementMapValue | undefined;
    static getCaretScreenPosition(textarea: HTMLTextAreaElement | HTMLInputElement): {
        top: number;
        left: number;
    };
    static searchWithPriority(query: string, items: string[]): string[];
    static focusAt(textarea: HTMLTextAreaElement, index: number): void;
    static loopClamp(value: number, max: number): number;
    static isOutOfScrollView(el: HTMLElement, container: HTMLElement): boolean;
    static tryParseBindings(bindings: string): Binding[] | undefined;
    /**
     * Determine whether the given `input` is iterable.
     *
     * @returns {Boolean}
     */
    static isIterable(input: any): boolean;
    static autoResizeInput(input: HTMLInputElement): void;
}
