import { selectedElement } from "../index.js";
window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft")
        selectedElement.style.left = `${parseFloat(selectedElement.style.left) - 10}px`;
    if (e.key === "ArrowRight")
        selectedElement.style.left = `${parseFloat(selectedElement.style.left) + 10}px`;
    if (e.key === "ArrowUp")
        selectedElement.style.top = `${parseFloat(selectedElement.style.top) - 10}px`;
    if (e.key === "ArrowDown")
        selectedElement.style.top = `${parseFloat(selectedElement.style.top) + 10}px`;
});
//# sourceMappingURL=arrowKeyElementMovement.js.map