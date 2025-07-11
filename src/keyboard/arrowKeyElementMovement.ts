import { config, selectedElement } from "../index.js";


/**
 * Triggers movement of the selected element based on the arrow keys.
 * Arrow key presses will move the element by the amount specified in
 * the config.arrow_key_move_amount setting.
 * @param {KeyboardEvent} e The event object associated with the arrow key press.
 */
export function triggerArrowMovement(e: KeyboardEvent): void {
    if (!selectedElement) return;

    // Movement
    if (e.key === "ArrowLeft") selectedElement!.style.left = `${parseFloat(selectedElement!.style.left) - config.arrow_key_move_amount}px`;
    if (e.key === "ArrowRight") selectedElement!.style.left = `${parseFloat(selectedElement!.style.left) + config.arrow_key_move_amount}px`;
    if (e.key === "ArrowUp") selectedElement!.style.top = `${parseFloat(selectedElement!.style.top) - config.arrow_key_move_amount}px`;
    if (e.key === "ArrowDown") selectedElement!.style.top = `${parseFloat(selectedElement!.style.top) + config.arrow_key_move_amount}px`;
    e.preventDefault();
}