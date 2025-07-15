import { Builder } from "../index.js";
import { triggerArrowMovement } from "./arrowKeyElementMovement.js";
/**
 * @type {KeyboardEvent}
 */
export let keyboardEvent = new KeyboardEvent("keypress");
window.addEventListener("keydown", (e) => {
    keyboardEvent = e;
    console.log(e.key);
    if (e?.key?.startsWith("Arrow"))
        triggerArrowMovement(e);
    if (e?.key === "Delete")
        Builder.deleteSelected();
});
window.addEventListener("keypress", (e) => {
    keyboardEvent = e;
});
window.addEventListener("keyup", (e) => {
    keyboardEvent = e;
});
//# sourceMappingURL=eventListeners.js.map