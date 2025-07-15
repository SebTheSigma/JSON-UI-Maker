import { ActionFormData } from "./form.js";
const form = new ActionFormData();
const runScripterButton = document.getElementById("run_scripter");
const scripterText = document.getElementById("scripter_text");
export function evalScript(script) {
    console.log('Running Script');
    eval(script);
}
// Evaluates the script on-click
runScripterButton.onclick = (() => evalScript(scripterText.value));
//# sourceMappingURL=eval.js.map