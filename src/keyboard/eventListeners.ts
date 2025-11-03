import { Copier } from "../copy_paste/copy.js";
import { Paster } from "../copy_paste/paste.js";
import { Builder, isInMainWindow, selectedElement } from "../index.js";
import { BindingsArea } from "../scripter/bindings/bindingsArea.js";
import { triggerArrowMovement } from "./arrowKeyElementMovement.js";
import { undoRedoManager } from "./undoRedo.js";

let inTextArea = false;
document.addEventListener("focusin", (e) => {
    const el: HTMLElement = e.target as HTMLElement;
    if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
        inTextArea = true;
    }
});

document.addEventListener("focusout", (e) => {
    const el: HTMLElement = e.target as HTMLElement;
    if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
        inTextArea = false;
    }
});

/**
 * @type {KeyboardEvent}
 */
export let keyboardEvent: KeyboardEvent = new KeyboardEvent("keypress");

window.addEventListener("keydown", (e) => {
    keyboardEvent = e;

    if (e?.key?.startsWith("Arrow") && !inTextArea) triggerArrowMovement(e);
    if (e?.key === "Delete") Builder.deleteSelected();

    if (BindingsArea.isBindingsTextAreaFocused && selectedElement) BindingsArea.handleKeyboardInput(e);

    if (!inTextArea) {
        if (e?.ctrlKey && e?.key === "c" && selectedElement) Copier.copyElement(selectedElement.dataset.id!);
        if (e?.ctrlKey && e?.key === "v") Paster.paste();
        if (e?.ctrlKey && e?.key === "x" && selectedElement) {
            Copier.copyElement(selectedElement.dataset.id!);
            Builder.deleteSelected();
        }
        if (e?.ctrlKey && e?.key === "z") {
            e.preventDefault();
            undoRedoManager.undo();
        }
        if (e?.ctrlKey && e?.key === "y") {
            e.preventDefault();
            undoRedoManager.redo();
        }
    }
});

window.addEventListener("keypress", (e) => {
    keyboardEvent = e;
});

window.addEventListener("keyup", (e) => {
    keyboardEvent = e;
});
