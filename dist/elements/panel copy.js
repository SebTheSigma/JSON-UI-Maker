import { isInMainWindow, selectedElement, setSelectedElement } from "../index.js";
import { config } from "../CONFIG.js";
import { updatePropertiesArea } from "../ui/propertiesArea.js";
import { AllJsonUIElements } from "./elements.js";
export class DraggablePanel {
    container;
    panel;
    resizeHandle;
    isDragging;
    isResizing;
    selected;
    offsetX;
    offsetY;
    resizeStartWidth;
    resizeStartHeight;
    resizeStartX;
    resizeStartY;
    /**
     * @param {HTMLElement} container
     */
    constructor(ID, container) {
        console.warn('diddy');
        let lastParent = container;
        let i = 0;
        parent_loop: while (true) {
            if (!lastParent)
                break parent_loop;
            lastParent = lastParent.parentElement;
            i++;
        }
        // Saves parameters
        this._constructorArgs = [ID, container];
        this.container = container;
        this.panel = document.createElement("div");
        this.panel.className = "draggable-panel";
        // Custom data
        this.panel.dataset.id = ID;
        const rect = container.getBoundingClientRect();
        this.panel.style.height = `${rect.height * 0.8}px`;
        this.panel.style.width = `${rect.width * 0.8}px`;
        console.log(`Left: ${rect.left}, Top: ${rect.top}`);
        console.log(`Width: ${rect.width}, Height: ${rect.height}`);
        // Frist element and therefore needs different positioning to center
        this.panel.style.left = `${rect.width / 2 - parseFloat(this.panel.style.width) / 2}px`;
        this.panel.style.top = `${rect.height / 2 - parseFloat(this.panel.style.height) / 2}px`;
        this.panel.style.backgroundColor = "rgba(255, 255, 255, 0)";
        this.panel.style.border = "2px solid black";
        this.panel.style.position = "absolute";
        this.panel.style.zIndex = String(2 * i);
        this.resizeHandle = document.createElement("div");
        this.resizeHandle.className = "resize-handle";
        this.panel.appendChild(this.resizeHandle);
        this.container.appendChild(this.panel);
        this.resizeHandle.style.zIndex = String(2 * i + 1);
        this.isDragging = false;
        this.isResizing = false;
        this.selected = false;
        this.offsetX = 0;
        this.offsetY = 0;
        this.initEvents();
    }
    initEvents() {
        this.panel.addEventListener("mousedown", (e) => this.startDrag(e));
        this.panel.addEventListener("dblclick", (e) => this.select(e));
        document.addEventListener("mousemove", (e) => this.drag(e));
        document.addEventListener("mouseup", () => this.stopDrag());
        this.resizeHandle.addEventListener("mousedown", (e) => this.startResize(e));
        document.addEventListener("mousemove", (e) => this.resize(e));
        document.addEventListener("mouseup", () => this.stopResize());
    }
    select(e) {
        e.stopPropagation(); // Prevent the event from bubbling up to the parent
        if (selectedElement) {
            if (selectedElement !== this.panel) {
                selectedElement.style.border = "2px solid black";
                selectedElement.style.outline = "2px solid black";
                this.selected = true;
                setSelectedElement(this.panel);
                this.panel.style.border = "2px solid blue";
                this.panel.style.outline = "2px solid blue";
                updatePropertiesArea();
                return;
            }
        }
        if (this.selected) {
            this.unSelect(e);
            return;
        }
        this.selected = true;
        setSelectedElement(this.panel);
        this.panel.style.border = "2px solid blue";
        this.panel.style.outline = "2px solid blue";
        updatePropertiesArea();
    }
    unSelect(_e) {
        this.selected = false;
        setSelectedElement(undefined);
        this.panel.style.border = "2px solid black";
        this.panel.style.outline = "2px solid black";
        updatePropertiesArea();
    }
    startDrag(e) {
        if (e.target === this.resizeHandle)
            return;
        // Stop propagation for nested elements
        for (let elementName of AllJsonUIElements) {
            if (this.container.classList.contains(elementName)) {
                e.stopPropagation();
            }
        }
        this.isDragging = true;
        // Get position relative to parent container
        const panelRect = this.panel.getBoundingClientRect();
        this.offsetX = e.clientX - panelRect.left;
        this.offsetY = e.clientY - panelRect.top;
        this.panel.style.cursor = "grabbing";
    }
    drag(e) {
        e.stopPropagation();
        if (!this.isDragging || this.isResizing)
            return;
        const containerRect = this.container.getBoundingClientRect();
        if (config.settings.boundary_constraints.value) {
            console.log("Boudary");
            let newLeft = e.clientX - containerRect.left - this.offsetX;
            let newTop = e.clientY - containerRect.top - this.offsetY;
            // Constrain to container bounds
            newLeft = Math.max(0, Math.min(newLeft, containerRect.width - this.panel.offsetWidth));
            newTop = Math.max(0, Math.min(newTop, containerRect.height - this.panel.offsetHeight));
            this.panel.style.left = `${newLeft}px`;
            this.panel.style.top = `${newTop}px`;
        }
        else {
            // Calculate position relative to parent container
            const newLeft = e.clientX - containerRect.left - this.offsetX;
            const newTop = e.clientY - containerRect.top - this.offsetY;
            this.panel.style.left = `${newLeft}px`;
            this.panel.style.top = `${newTop}px`;
        }
    }
    stopDrag() {
        this.isDragging = false;
        this.panel.style.cursor = "grab";
        if (isInMainWindow)
            updatePropertiesArea();
    }
    startResize(e) {
        e.stopPropagation(); // Prevent event from bubbling to parent
        this.isResizing = true;
        this.resizeStartWidth = parseFloat(this.panel.style.width);
        this.resizeStartHeight = parseFloat(this.panel.style.height);
        this.resizeStartX = e.clientX;
        this.resizeStartY = e.clientY;
        e.preventDefault();
    }
    resize(e) {
        if (!this.isResizing)
            return;
        e.stopPropagation(); // Prevent event from bubbling to parent
        const widthChange = e.clientX - this.resizeStartX;
        const heightChange = e.clientY - this.resizeStartY;
        this.panel.style.width = `${this.resizeStartWidth + widthChange}px`;
        this.panel.style.height = `${this.resizeStartHeight + heightChange}px`;
    }
    stopResize() {
        this.isResizing = false;
        if (isInMainWindow)
            updatePropertiesArea();
    }
    getMainHTMLElement() {
        return this.panel;
    }
}
//# sourceMappingURL=panel%20copy.js.map