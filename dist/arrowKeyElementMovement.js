import { config, selectedElement } from "./index.js";
window.addEventListener("keydown", (e) => {
    if (!selectedElement)
        return;
    console.log(e.key);
    if (e.key === "ArrowLeft")
        selectedElement.style.left = `${parseFloat(selectedElement.style.left) - config.arrow_key_move_amount}px`;
    if (e.key === "ArrowRight")
        selectedElement.style.left = `${parseFloat(selectedElement.style.left) + config.arrow_key_move_amount}px`;
    if (e.key === "ArrowUp")
        selectedElement.style.top = `${parseFloat(selectedElement.style.top) - config.arrow_key_move_amount}px`;
    if (e.key === "ArrowDown")
        selectedElement.style.top = `${parseFloat(selectedElement.style.top) + config.arrow_key_move_amount}px`;
    e.preventDefault();
});
//# sourceMappingURL=arrowKeyElementMovement.js.map