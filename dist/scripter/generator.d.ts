interface FormButtonData {
    texture: string;
    text: string;
}
export declare class ScriptGenerator {
    /**
     * Generates a script based on the current state of the UI.
     * This function is called when the "Generate Scripter" button is clicked.
     * It loops through all the buttons in the UI, gets their texture and text, and logs it to the console.
     * The logged data is in the following format: { texture: string, text: string }
     * This function is intended to be called by the "Generate Scripter" button.
     */
    static generateScript(): void;
    /**
     * Given an HTML element, returns an object containing the texture and text to display for that button.
     *
     * @param element The HTML element to get the texture and text from.
     * @returns An object with two properties, texture and text, containing the texture and text to display for the given button.
     */
    static getButtonInfo(element: HTMLElement): FormButtonData;
}
export {};
