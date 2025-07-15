import { ActionFormData } from "./form.js"; 

const form: ActionFormData = new ActionFormData();

const runScripterButton: HTMLButtonElement = document.getElementById("run_scripter")! as HTMLButtonElement;
const scripterText: HTMLTextAreaElement = document.getElementById("scripter_text")! as HTMLTextAreaElement;

export function evalScript(script: string): void {
    console.log('Running Script')
    eval(script);
}

// Evaluates the script on-click
runScripterButton.onclick! = (() => evalScript(scripterText.value));