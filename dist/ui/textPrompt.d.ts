export declare class TextPrompt {
    promptBox: HTMLElement;
    textarea: HTMLInputElement | HTMLTextAreaElement;
    attached: boolean;
    offset: [number, number];
    hovered: boolean;
    lastSelectionStart: number;
    lastSelectionEnd: number;
    highlightedIndex: number;
    data: any;
    textOptions: string[];
    actions: ((value: string) => void)[];
    constructor(textarea: HTMLInputElement | HTMLTextAreaElement);
    addTextOptions(text: string[], actions: ((value: string) => void)[] | ((value: string) => void)): void;
    updatePosition(): void;
    attach(): void;
    detach(): void;
    autoCorrectHighlightedText(): void;
    setHighlightedIndex(index: number): void;
}
