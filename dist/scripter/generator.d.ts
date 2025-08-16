export interface FormButtonData {
    texture: string;
    text: string;
}
export declare class ScriptGenerator {
    static init(): void;
    /**
     * Generates a script based on the current state of the UI.
     * This function is called when the "Generate Scripter" button is clicked.
     * It loops through all the buttons in the UI, gets their texture and text, and logs it to the console.
     * The logged data is in the following format: { texture: string, text: string }
     * This function is intended to be called by the "Generate Scripter" button.
     */
    static generateScript(language: 'ts' | 'js'): void;
    /**
     * Retrieves the button information from a given HTML element.
     *
     * @param element - The HTML element representing the button.
     * @returns An object containing the texture path and text for the button.
     */
    static getButtonInfo(element: HTMLElement): FormButtonData;
}
