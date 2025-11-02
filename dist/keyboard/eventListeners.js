import { Copier } from "../copy_paste/copy.js";
import { Paster } from "../copy_paste/paste.js";
import { Builder, selectedElement } from "../index.js";
import { BindingsArea } from "../scripter/bindings/bindingsArea.js";
import { triggerArrowMovement } from "./arrowKeyElementMovement.js";
let inTextArea = false;
document.addEventListener("focusin", (e) => {
    const el = e.target;
    if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
        inTextArea = true;
    }
});
document.addEventListener("focusout", (e) => {
    const el = e.target;
    if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
        inTextArea = false;
    }
});
/**
 * @type {KeyboardEvent}
 */
export let keyboardEvent = new KeyboardEvent("keypress");
window.addEventListener("keydown", (e) => {
    keyboardEvent = e;
    if (e?.key?.startsWith("Arrow") && !inTextArea)
        triggerArrowMovement(e);
    if (e?.key === "Delete")
        Builder.deleteSelected();
    if (BindingsArea.isBindingsTextAreaFocused && selectedElement)
        BindingsArea.handleKeyboardInput(e);
    if (!inTextArea) {
        if (e?.ctrlKey && e?.key === "c" && selectedElement)
            Copier.copyElement(selectedElement.dataset.id);
        if (e?.ctrlKey && e?.key === "v")
            Paster.paste();
        if (e?.ctrlKey && e?.key === "x" && selectedElement) {
            Copier.copyElement(selectedElement.dataset.id);
            Builder.deleteSelected();
        }
    }
});
window.addEventListener("keypress", (e) => {
    keyboardEvent = e;
});
window.addEventListener("keyup", (e) => {
    keyboardEvent = e;
});
//# sourceMappingURL=eventListeners.js.map