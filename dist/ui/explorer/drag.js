import { StringUtil } from "../../util/stringUtil.js";
export const registeredElements = new Map();
export class ExplorerDrag {
    id = StringUtil.generateRandomString(15);
    textElement;
    handleMouseDown = undefined;
    handleMouseMove = undefined;
    handleMouseUp = undefined;
    constructor(textElement) {
        console.warn("eeeeeeeeeeee");
        const textLabelElement = textElement.querySelector(".explorerText");
        if (!textLabelElement)
            return;
        if (registeredElements.has(textElement.dataset.mapId ?? ""))
            return;
        this.id = StringUtil.generateRandomString(15);
        textElement.dataset.mapId = this.id;
        registeredElements.set(this.id, this);
        this.textElement = textElement;
        let dragTextElement = null;
        let isDragging = false;
        this.handleMouseDown = (e) => {
            e.stopPropagation();
            isDragging = true;
            dragTextElement = document.createElement("div");
            dragTextElement.classList.add("explorerDragTextBackground");
            const dragTextLabelElement = document.createElement("div");
            dragTextLabelElement.classList.add("explorerDragText");
            dragTextLabelElement.textContent = textLabelElement.textContent;
            dragTextElement.appendChild(dragTextLabelElement);
            document.body.appendChild(dragTextElement);
            // Prevent text selection while dragging
            e.preventDefault();
        };
        this.handleMouseMove = (e) => {
            if (!isDragging)
                return;
            e.stopPropagation();
            console.log(e.clientX, e.clientY);
            dragTextElement.style.left = `${e.clientX}px`;
            dragTextElement.style.top = `${e.clientY - 12}px`;
        };
        this.handleMouseUp = (e) => {
            e.stopPropagation();
            isDragging = false;
            if (dragTextElement) {
                console.warn("eeeeeeeeeeee", 6, isDragging);
                dragTextElement.remove();
                dragTextElement = null;
            }
        };
        textLabelElement.addEventListener("mousedown", this.handleMouseDown);
        console.log(5, registeredElements);
    }
    destroy() {
        const textLabelElement = this.textElement.querySelector(".explorerText");
        if (textLabelElement && this.handleMouseDown) {
            textLabelElement.removeEventListener("mousedown", this.handleMouseDown);
        }
        if (this.handleMouseMove) {
            document.removeEventListener("mousemove", this.handleMouseMove);
        }
        if (this.handleMouseUp) {
            document.removeEventListener("mouseup", this.handleMouseUp);
        }
        // Remove from registry
        registeredElements.delete(this.id);
        // Optional: clear dataset
        delete this.textElement.dataset.mapId;
        // Null out handlers
        this.handleMouseDown = undefined;
        this.handleMouseMove = undefined;
        this.handleMouseUp = undefined;
    }
}
const mouseMove = (e) => {
    for (const drag of registeredElements.values()) {
        drag.handleMouseMove(e);
    }
};
const mouseUp = (e) => {
    for (const drag of registeredElements.values()) {
        console.warn('SSSSSSSSS');
        drag.handleMouseUp(e);
    }
};
export function enterExplorerArea() {
    console.warn('ENTERED');
    document.addEventListener("mousemove", mouseMove);
    document.addEventListener("mouseup", mouseUp);
}
export function leaveExplorerArea() {
    console.warn('LEAVED');
    document.removeEventListener("mousemove", mouseMove);
    document.removeEventListener("mouseup", mouseUp);
}
//# sourceMappingURL=drag.js.map