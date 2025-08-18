import { buttonDataToJavaScript, buttonDataToTypeScript } from "./scriptFormText.js";
import { DraggableButton } from "../elements/button.js";
import { GeneralUtil } from "../util/generalUtil.js";

export interface FormButtonData {
    texture: string,
    text: string,
}


export class ScriptGenerator {

    public static init(): void {
        const generateJavaScriptButton: HTMLTextAreaElement = document.getElementById("generate_js_scripter") as HTMLTextAreaElement;
        const generateTypeScriptButton: HTMLTextAreaElement = document.getElementById("generate_ts_scripter") as HTMLTextAreaElement;
        generateJavaScriptButton?.addEventListener("click", () => this.generateScript('js'));
        generateTypeScriptButton?.addEventListener("click", () => this.generateScript('ts'));
    }

    /**
     * Generates a script based on the current state of the UI.
     * This function is called when the "Generate Scripter" button is clicked.
     * It loops through all the buttons in the UI, gets their texture and text, and logs it to the console.
     * The logged data is in the following format: { texture: string, text: string }
     * This function is intended to be called by the "Generate Scripter" button.
     */
    static generateScript(language: 'ts' | 'js'): void {
        const buttons = document.getElementsByClassName("draggable-button");
        const buttonInfo = Array.from(buttons).map((button) => this.getButtonInfo(button as HTMLElement));

        let txt: string = '';
        if (language === 'ts') {
            txt = buttonDataToTypeScript(buttonInfo);
            new Notification('JS Copied to Clipboard!');
        }

        else if (language === 'js') {
            txt = buttonDataToJavaScript(buttonInfo);
            new Notification('TS Copied to Clipboard!');
        }

        navigator.clipboard.writeText(txt);
    }
    
    /**
     * Retrieves the button information from a given HTML element.
     * 
     * @param element - The HTML element representing the button.
     * @returns An object containing the texture path and text for the button.
     */
    static getButtonInfo(element: HTMLElement): FormButtonData {
        const buttonClass = GeneralUtil.elementToClassElement(element) as DraggableButton;

        const text = buttonClass.displayText?.mirror?.textContent ?? 'Label';

        return {
            texture: `textures/ui/${element.dataset.displayImageName ?? "blank"}`,
            text: text
        }
    }
}