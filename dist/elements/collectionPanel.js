import { isInMainWindow, panelContainer } from "../index.js";
import { config } from "../CONFIG.js";
import { updatePropertiesArea } from "../ui/propertiesArea.js";
import { AllJsonUIElements } from "./elements.js";
import { ElementSharedFuncs } from "./sharedElement.js";
import { GeneralUtil } from "../util/generalUtil.js";
export class DraggableCollectionPanel {
    // Core elements
    container;
    panel;
    resizeHandle;
    // State flags
    isDragging = false;
    isResizing = false;
    selected = false;
    deleteable = true;
    // Positioning & movement
    offsetX = 0;
    offsetY = 0;
    // Resize state
    resizeStartWidth;
    resizeStartHeight;
    resizeStartX;
    resizeStartY;
    resizeStartLeft;
    resizeStartTop;
    // Data
    bindings = "";
    /**
     * @param {HTMLElement} container
     */
    constructor(ID, container, collectionName = config.defaultCollectionName) {
        const i = GeneralUtil.getElementDepth(container, panelContainer);
        // Saves parameters
        this._constructorArgs = [ID, container, collectionName];
        this.container = container;
        const rect = container.getBoundingClientRect();
        this.panel = document.createElement("div");
        this.panel.className = "draggable-collection_panel";
        this.panel.style.visibility = "visible";
        this.panel.dataset.collectionName = collectionName;
        this.panel.dataset.id = ID;
        this.panel.style.height = `${rect.height * 0.8}px`;
        this.panel.style.width = `${rect.width * 0.8}px`;
        this.panel.style.left = `${rect.width / 2 - parseFloat(this.panel.style.width) / 2}px`;
        this.panel.style.top = `${rect.height / 2 - parseFloat(this.panel.style.height) / 2}px`;
        this.panel.style.backgroundColor = "rgba(255, 255, 255, 0)";
        this.panel.style.border = "2px solid black";
        this.panel.style.outline = "2px solid black";
        this.panel.style.position = "absolute";
        this.panel.style.zIndex = String(2 * i);
        this.resizeHandle = document.createElement("div");
        this.resizeHandle.className = "resize-handle";
        this.resizeHandle.style.zIndex = String(2 * i + 1);
        this.panel.appendChild(this.resizeHandle);
        this.container.appendChild(this.panel);
        this.initEvents();
        this.grid(config.settings.show_grid.value);
    }
    initEvents() {
        this.panel.addEventListener("mousedown", (e) => this.startDrag(e));
        this.panel.addEventListener("dblclick", (e) => this.select(e));
        document.addEventListener("mousemove", (e) => this.drag(e));
        document.addEventListener("mouseup", () => this.stopDrag());
        this.resizeHandle.addEventListener("mousedown", (e) => ElementSharedFuncs.startResize(e, this));
        document.addEventListener("mousemove", (e) => ElementSharedFuncs.resize(e, this));
        document.addEventListener("mouseup", () => ElementSharedFuncs.stopResize(this));
    }
    select(e) {
        ElementSharedFuncs.select(e, this);
        this.grid(config.settings.show_grid.value);
    }
    unSelect(_e) {
        ElementSharedFuncs.unSelect(this);
        this.grid(false);
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
        if (!this.isDragging || this.isResizing)
            return;
        const containerRect = this.container.getBoundingClientRect();
        if (config.settings.boundary_constraints.value) {
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
    getMainHTMLElement() {
        return this.panel;
    }
    delete() {
        if (!this.deleteable)
            return;
        if (this.selected)
            this.unSelect();
        this.container.removeChild(this.getMainHTMLElement());
        document.removeEventListener("mousemove", (e) => this.drag(e));
        document.removeEventListener("mouseup", () => this.stopDrag());
        document.removeEventListener("mousemove", (e) => ElementSharedFuncs.resize(e, this));
        document.removeEventListener("mouseup", () => ElementSharedFuncs.stopResize(this));
    }
    grid(showGrid) {
        const element = this.getMainHTMLElement();
        if (!showGrid) {
            element.style.removeProperty("--grid-cols");
            element.style.removeProperty("--grid-rows");
        }
        else {
            element.style.setProperty("--grid-cols", String(config.settings.grid_lock_columns.value));
            element.style.setProperty("--grid-rows", String(config.settings.grid_lock_rows.value));
        }
    }
}
//# sourceMappingURL=collectionPanel.js.map