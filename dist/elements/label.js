import { isInMainWindow, selectedElement, setSelectedElement } from "../index.js";
import { config } from "../CONFIG.js";
import { updatePropertiesArea } from "../ui/propertiesArea.js";
import { AllJsonUIElements } from "./elements.js";
export class DraggableLabel {
    container;
    label;
    mirror;
    isDragging;
    selected;
    offsetX;
    offsetY;
    /**
     * @param {HTMLElement} container
     */
    constructor(ID, container, labelOptions) {
        let lastParent = container;
        let i = 0;
        parent_loop: while (true) {
            if (!lastParent)
                break parent_loop;
            lastParent = lastParent.parentElement;
            i++;
        }
        this.container = container;
        const textAlign = labelOptions?.textAlign ?? "left";
        const fontSize = labelOptions?.fontScale ?? 1;
        const fontColor = labelOptions?.fontColor ?? [255, 255, 255];
        // Create the textarea
        this.label = document.createElement("textarea");
        this.label.value = labelOptions ? labelOptions.text : "";
        this.label.className = "draggable-label";
        this.label.style.overflow = "hidden";
        this.label.style.resize = "none";
        this.label.style.minWidth = "10px";
        this.label.style.minHeight = "20px";
        this.label.style.border = "2px solid black";
        this.label.style.font = "16px sans-serif";
        this.label.style.padding = "4px";
        this.label.wrap = "off";
        this.label.style.fontFamily = 'MinecraftRegular';
        this.label.spellcheck = false;
        this.label.style.color = `rgb(${fontColor[0], fontColor[1], fontColor[2]})`;
        // Add to container
        container.appendChild(this.label);
        // Create a hidden mirror for sizing
        this.mirror = document.createElement("div");
        this.mirror.style.position = "relative";
        this.mirror.style.width = "fit-content";
        this.mirror.style.visibility = "hidden";
        this.mirror.style.whiteSpace = "pre-wrap";
        this.mirror.style.wordWrap = "break-word";
        this.mirror.style.font = this.label.style.font;
        this.mirror.style.padding = this.label.style.padding;
        this.mirror.style.border = this.label.style.border;
        this.mirror.style.boxSizing = "border-box";
        this.container.appendChild(this.mirror);
        // Properties
        this.label.style.textAlign = textAlign;
        this.label.style.fontSize = `${fontSize}em`;
        this.mirror.style.textAlign = textAlign;
        this.mirror.style.fontSize = `${fontSize}em`;
        // Custom data
        this.label.dataset.id = ID;
        const parentRect = container.getBoundingClientRect();
        const rect = this.label.getBoundingClientRect();
        console.log(`Left: ${rect.left}, Top: ${rect.top}`);
        console.log(`Width: ${rect.width}, Height: ${rect.height}`);
        // Frist element and therefore needs different positioning to center
        this.label.style.left = `${parentRect.width / 2}px`;
        this.label.style.top = `${parentRect.height / 2}px`;
        this.label.style.backgroundColor = "rgba(255, 255, 255, 0)";
        this.label.style.position = "absolute";
        this.label.style.zIndex = String(2 * i);
        this.container.appendChild(this.label);
        this.isDragging = false;
        this.selected = false;
        this.offsetX = 0;
        this.offsetY = 0;
        this.initEvents();
    }
    updateSize() {
        this.mirror.textContent = this.label.value || " ";
        const mirrorRect = this.mirror.getBoundingClientRect();
        const scalar = parseFloat(this.label.style.fontSize);
        console.warn(`Scalar: ${scalar}`);
        this.label.style.width = `${mirrorRect.width}px`;
        this.label.style.height = `${mirrorRect.height}px`;
        updatePropertiesArea();
    }
    ;
    initEvents() {
        this.label.addEventListener("mousedown", (e) => this.startDrag(e));
        this.label.addEventListener("dblclick", (e) => this.select(e));
        document.addEventListener("mousemove", (e) => this.drag(e));
        document.addEventListener("mouseup", () => this.stopDrag());
        // Initial size
        this.updateSize();
        // Auto-resize on input
        this.label.addEventListener("input", () => this.updateSize());
    }
    select(e) {
        e.stopPropagation(); // Prevent the event from bubbling up to the parent
        if (selectedElement) {
            if (selectedElement !== this.label) {
                selectedElement.style.border = "2px solid black";
                selectedElement.style.outline = "2px solid black";
                this.selected = true;
                setSelectedElement(this.label);
                this.label.style.border = "2px solid blue";
                this.label.style.outline = "2px solid blue";
                updatePropertiesArea();
                return;
            }
        }
        if (this.selected) {
            this.unSelect(e);
            return;
        }
        this.selected = true;
        setSelectedElement(this.label);
        this.label.style.border = "2px solid blue";
        this.label.style.outline = "2px solid blue";
        updatePropertiesArea();
    }
    unSelect(_e) {
        this.selected = false;
        setSelectedElement(undefined);
        this.label.style.border = "2px solid black";
        this.label.style.outline = "2px solid black";
        updatePropertiesArea();
    }
    startDrag(e) {
        // Stop propagation for nested elements
        for (let elementName of AllJsonUIElements) {
            if (this.container.classList.contains(elementName)) {
                e.stopPropagation();
            }
        }
        this.isDragging = true;
        // Get position relative to parent container
        const labelRect = this.label.getBoundingClientRect();
        this.offsetX = e.clientX - labelRect.left;
        this.offsetY = e.clientY - labelRect.top;
        this.label.style.cursor = "grabbing";
    }
    drag(e) {
        e.stopPropagation();
        if (!this.isDragging)
            return;
        const containerRect = this.container.getBoundingClientRect();
        if (config.settings.boundary_constraints.value) {
            console.log("Boudary");
            let newLeft = e.clientX - containerRect.left - this.offsetX;
            let newTop = e.clientY - containerRect.top - this.offsetY;
            // Constrain to container bounds
            newLeft = Math.max(0, Math.min(newLeft, containerRect.width - this.label.offsetWidth));
            newTop = Math.max(0, Math.min(newTop, containerRect.height - this.label.offsetHeight));
            this.label.style.left = `${newLeft}px`;
            this.label.style.top = `${newTop}px`;
        }
        else {
            // Calculate position relative to parent container
            const newLeft = e.clientX - containerRect.left - this.offsetX;
            const newTop = e.clientY - containerRect.top - this.offsetY;
            this.label.style.left = `${newLeft}px`;
            this.label.style.top = `${newTop}px`;
        }
    }
    stopDrag() {
        this.isDragging = false;
        this.label.style.cursor = "grab";
        if (isInMainWindow)
            updatePropertiesArea();
    }
}
//# sourceMappingURL=label.js.map