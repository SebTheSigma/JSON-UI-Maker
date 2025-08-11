import { buttonDataToJavaScript, buttonDataToTypeScript } from "./scriptFormText.js";
import { GeneralUtil } from "../util/generalUtil.js";
export class ScriptGenerator {
    /**
     * Generates a script based on the current state of the UI.
     * This function is called when the "Generate Scripter" button is clicked.
     * It loops through all the buttons in the UI, gets their texture and text, and logs it to the console.
     * The logged data is in the following format: { texture: string, text: string }
     * This function is intended to be called by the "Generate Scripter" button.
     */
    static generateScript(language) {
        console.log('Generating script...');
        const buttons = document.getElementsByClassName("draggable-button");
        const buttonInfo = Array.from(buttons).map((button) => ScriptGenerator.getButtonInfo(button));
        let txt = '';
        if (language === 'ts') {
            txt = buttonDataToTypeScript(buttonInfo);
        }
        else if (language === 'js') {
            txt = buttonDataToJavaScript(buttonInfo);
        }
        console.log('Script generation complete.', txt);
        console.log('Copying to clipboard...');
        navigator.clipboard.writeText(txt);
        console.log('Copied to clipboard.');
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
const generateJavaScriptButton = document.getElementById("generate_js_scripter");
const generateTypeScriptButton = document.getElementById("generate_ts_scripter");
generateJavaScriptButton?.addEventListener("click", () => ScriptGenerator.generateScript('js'));
generateTypeScriptButton?.addEventListener("click", () => ScriptGenerator.generateScript('ts'));
//# sourceMappingURL=generator.js.map