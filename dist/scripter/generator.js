import { buttonDataToJavaScript, buttonDataToTypeScript } from "./scriptFormText.js";
import { GeneralUtil } from "../util/generalUtil.js";
export class ScriptGenerator {
    static init() {
        const generateJavaScriptButton = document.getElementById("generate_js_scripter");
        const generateTypeScriptButton = document.getElementById("generate_ts_scripter");
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
    static generateScript(language) {
        const buttons = document.getElementsByClassName("draggable-button");
        const buttonInfo = Array.from(buttons).map((button) => this.getButtonInfo(button));
        let txt = '';
        if (language === 'ts') {
            txt = buttonDataToTypeScript(buttonInfo);
        }
        else if (language === 'js') {
            txt = buttonDataToJavaScript(buttonInfo);
        }
        navigator.clipboard.writeText(txt);
    }
    /**
     * Retrieves the button information from a given HTML element.
     *
     * @param element - The HTML element representing the button.
     * @returns An object containing the texture path and text for the button.
     */
    static getButtonInfo(element) {
        const buttonClass = GeneralUtil.elementToClassElement(element);
        const text = buttonClass.displayText?.mirror?.textContent ?? 'Label';
        return {
            texture: `textures/ui/${element.dataset.displayImageName ?? "blank"}`,
            text: text
        };
    }
}
//# sourceMappingURL=generator.js.map