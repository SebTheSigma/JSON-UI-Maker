import { triggerArrowMovement } from "./arrowKeyElementMovement.js";
/**
 * @type {KeyboardEvent}
 */
export let keyboardEvent = new KeyboardEvent("keypress");
window.addEventListener("keydown", (e) => {
    keyboardEvent = e;
    if (e.key.startsWith("Arrow"))
        triggerArrowMovement(e);
});
window.addEventListener("keypress", (e) => {
    keyboardEvent = e;
});
window.addEventListener("keyup", (e) => {
    keyboardEvent = e;
});
//# sourceMappingURL=eventListeners.js.map