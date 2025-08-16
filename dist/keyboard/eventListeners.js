import { Builder, selectedElement } from "../index.js";
import { BindingsArea } from "../scripter/bindings/bindingsArea.js";
import { triggerArrowMovement } from "./arrowKeyElementMovement.js";
/**
 * @type {KeyboardEvent}
 */
export let keyboardEvent = new KeyboardEvent("keypress");
window.addEventListener("keydown", (e) => {
    keyboardEvent = e;
    if (e?.key?.startsWith("Arrow"))
        triggerArrowMovement(e);
    if (e?.key === "Delete")
        Builder.deleteSelected();
    if (BindingsArea.isBindingsTextAreaFocused && selectedElement)
        BindingsArea.handleKeyboardInput(e);
});
window.addEventListener("keypress", (e) => {
    keyboardEvent = e;
});
window.addEventListener("keyup", (e) => {
    keyboardEvent = e;
});
//# sourceMappingURL=eventListeners.js.map