type FormButton = {
    text: string;
    texture: string;
};
export declare class ActionFormData {
    titleString?: string;
    formText?: string;
    buttons: FormButton[];
    constructor();
    title(title: string): void;
    button(text: string, texture: string): void;
    body(text: string): void;
}
export {};
