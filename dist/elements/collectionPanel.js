import { panelContainer } from "../index.js";
import { config } from "../CONFIG.js";
import { ElementSharedFuncs } from "./sharedElement.js";
import { GeneralUtil } from "../util/generalUtil.js";
export class DraggableCollectionPanel {
    // Core elements
    container;
    panel;
    resizeHandle;
    gridElement;
    centerCircle;
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
        this.panel.style.border = `${config.settings.element_outline.value}px solid black`;
        this.panel.style.outline = `${config.settings.element_outline.value}px solid black`;
        this.panel.style.position = "absolute";
        this.panel.style.zIndex = String(2 * i);
        this.resizeHandle = document.createElement("div");
        this.resizeHandle.className = "resize-handle";
        this.resizeHandle.style.zIndex = String(2 * i + 1);
        this.gridElement = ElementSharedFuncs.generateGridElement();
        this.centerCircle = ElementSharedFuncs.generateCenterPoint();
        this.panel.appendChild(this.resizeHandle);
        this.panel.appendChild(this.gridElement);
        this.panel.appendChild(this.centerCircle);
        this.container.appendChild(this.panel);
        this.initEvents();
        this.grid(false);
        ElementSharedFuncs.updateCenterCirclePosition(this);
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
        ElementSharedFuncs.select(e, this);
    }
    unSelect(_e) {
        ElementSharedFuncs.unSelect(this);
    }
    startDrag(e) {
        if (e.target === this.resizeHandle)
            return;
        ElementSharedFuncs.startDrag(e, this);
        this.centerCircle.style.display = "block";
    }
    drag(e) {
        ElementSharedFuncs.drag(e, this);
    }
    stopDrag() {
        ElementSharedFuncs.stopDrag(this);
        this.centerCircle.style.display = "none";
    }
    startResize(e) {
        ElementSharedFuncs.startResize(e, this);
    }
    resize(e) {
        if (!this.isResizing)
            return;
        ElementSharedFuncs.resize(e, this);
        ElementSharedFuncs.updateCenterCirclePosition(this);
    }
    stopResize() {
        ElementSharedFuncs.stopResize(this);
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
        this.detach();
    }
    detach() {
        document.removeEventListener("mousemove", (e) => this.drag(e));
        document.removeEventListener("mouseup", () => this.stopDrag());
        document.removeEventListener("mousemove", (e) => this.resize(e));
        document.removeEventListener("mouseup", () => this.stopResize());
    }
    grid(showGrid) {
        ElementSharedFuncs.grid(showGrid, this);
    }
}
//# sourceMappingURL=collectionPanel.js.map