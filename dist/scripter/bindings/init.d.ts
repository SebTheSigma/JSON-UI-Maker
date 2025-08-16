export declare class BindingsArea {
    private static placeHolderBindings;
    static bindingsTextArea: HTMLTextAreaElement;
    static errorMessage: HTMLLabelElement;
    static isBindingsTextAreaFocused: boolean;
    static init(): void;
    static format(): void;
    static indent(e: KeyboardEvent): void;
    static tryOpenBrackets(e: KeyboardEvent): boolean;
    static updateBindingsEditor(): void;
    static handleKeyboardInput(e: KeyboardEvent): void;
}
