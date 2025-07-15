import { selectedElement } from "../index.js";
import { config } from '../CONFIG.js';
let focused = false;
document.addEventListener('focusin', (e) => {
    const el = e.target;
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        focused = true;
    }
});
document.addEventListener('focusout', (e) => {
    const el = e.target;
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        focused = false;
    }
});
/**
 * Triggers movement of the selected element based on the arrow keys.
 * Arrow key presses will move the element by the amount specified in
 * the config.settings.arrow_key_move_amount setting.
 * @param {KeyboardEvent} e The event object associated with the arrow key press.
 */
export function triggerArrowMovement(e) {
    if (!selectedElement)
        return;
    // Allows user to use the arrow-
    // keys while in a text-field element
    if (focused)
        return;
    // Movement
    if (e.key === "ArrowLeft")
        selectedElement.style.left = `${parseFloat(selectedElement.style.left) - config.settings.arrow_key_move_amount.value}px`;
    if (e.key === "ArrowRight")
        selectedElement.style.left = `${parseFloat(selectedElement.style.left) + config.settings.arrow_key_move_amount.value}px`;
    if (e.key === "ArrowUp")
        selectedElement.style.top = `${parseFloat(selectedElement.style.top) - config.settings.arrow_key_move_amount.value}px`;
    if (e.key === "ArrowDown")
        selectedElement.style.top = `${parseFloat(selectedElement.style.top) + config.settings.arrow_key_move_amount.value}px`;
    e.preventDefault();
}
//# sourceMappingURL=arrowKeyElementMovement.js.map