export class ScriptGenerator {
    /**
     * Generates a script based on the current state of the UI.
     * This function is called when the "Generate Scripter" button is clicked.
     * It loops through all the buttons in the UI, gets their texture and text, and logs it to the console.
     * The logged data is in the following format: { texture: string, text: string }
     * This function is intended to be called by the "Generate Scripter" button.
     */
    static generateScript() {
        console.log('Generating script...');
        const buttons = document.getElementsByClassName("draggable-button");
        for (let button of Array.from(buttons)) {
            const info = this.getButtonInfo(button);
            console.log(info);
        }
        console.log('Script generation complete.');
    }
    /**
     * Given an HTML element, returns an object containing the texture and text to display for that button.
     *
     * @param element The HTML element to get the texture and text from.
     * @returns An object with two properties, texture and text, containing the texture and text to display for the given button.
     */
    static getButtonInfo(element) {
        return {
            texture: `texture/ui/${element.dataset.displayImageName}`,
            text: 'hello'
        };
    }
}
const generateScriptButton = document.getElementById("generate_scripter");
generateScriptButton?.addEventListener("click", () => ScriptGenerator.generateScript());
//# sourceMappingURL=generator.js.map