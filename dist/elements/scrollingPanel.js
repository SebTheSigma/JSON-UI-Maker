import { panelContainer } from "../index.js";
import { config } from "../CONFIG.js";
import { MinecraftSlider } from "../ui/sliders/addMinecraftSlider.js";
import { ElementSharedFuncs } from "./sharedElement.js";
import { GeneralUtil } from "../util/generalUtil.js";
import { ExplorerController } from "../ui/explorer/explorerController.js";
export class DraggableScrollingPanel {
    // Core elements
    container;
    basePanel;
    panel;
    resizeHandle;
    slider;
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
    constructor(ID, container) {
        const i = GeneralUtil.getElementDepth(container, panelContainer);
        // Saves parameters
        this._constructorArgs = [ID, container];
        this.container = container;
        const rect = container.getBoundingClientRect();
        this.basePanel = document.createElement("div");
        this.basePanel.style.position = "absolute";
        this.basePanel.dataset.skip = "true";
        this.basePanel.style.visibility = "visible";
        this.basePanel.style.width = `${rect.width * 0.8}px`;
        this.basePanel.style.height = `${rect.height * 0.8}px`;
        this.basePanel.style.left = `${rect.width / 2 - parseFloat(this.basePanel.style.width) / 2}px`;
        this.basePanel.style.top = `${rect.height / 2 - parseFloat(this.basePanel.style.height) / 2}px`;
        this.panel = document.createElement("div");
        this.panel.className = "draggable-scrolling_panel";
        this.panel.style.position = "absolute";
        this.panel.dataset.id = ID;
        this.panel.style.width = this.basePanel.style.width;
        this.panel.style.height = this.basePanel.style.height;
        this.panel.style.backgroundColor = "rgba(255, 255, 255, 0)";
        this.panel.style.outline = `${config.settings.element_outline.value}px solid black`;
        this.panel.style.zIndex = String(2 * i);
        this.resizeHandle = document.createElement("div");
        this.resizeHandle.className = "resize-handle";
        this.resizeHandle.style.zIndex = String(2 * i + 2);
        this.resizeHandle.style.position = "sticky";
        this.panel.appendChild(this.resizeHandle);
        this.basePanel.appendChild(this.panel);
        this.container.appendChild(this.basePanel);
        this.slider = new MinecraftSlider(this);
        this.initEvents();
        setTimeout(() => {
            ExplorerController.updateExplorer();
        }, 0);
    }
    initEvents() {
        this.panel.addEventListener("mousedown", (e) => this.startDrag(e));
        this.panel.addEventListener("dblclick", (e) => this.select(e));
        this.resizeHandle.addEventListener("mousedown", (e) => this.startResize(e));
        this.panel.addEventListener("scroll", () => this.slider.updateHandle());
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
    }
    drag(e) {
        ElementSharedFuncs.drag(e, this, this.basePanel);
    }
    stopDrag() {
        ElementSharedFuncs.stopDrag(this);
    }
    startResize(e) {
        this.slider.setMoveType("instant");
        ElementSharedFuncs.startResize(e, this);
    }
    resize(e) {
        if (!this.isResizing)
            return;
        this.slider.updateHandle();
        ElementSharedFuncs.resize(e, this);
        this.basePanel.style.width = this.panel.style.width;
        this.basePanel.style.height = this.panel.style.height;
    }
    stopResize() {
        this.slider.setMoveType("smooth");
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
        this.container.removeChild(this.basePanel);
        this.slider.delete();
        this.panel.removeEventListener("scroll", () => this.slider.updateHandle());
    }
    detach() { }
    hide() {
        this.panel.style.outline = "0px solid black";
        this.resizeHandle.style.visibility = "hidden";
        this.slider.hide();
    }
    show() {
        this.panel.style.outline = `${config.settings.element_outline.value}px solid black`;
        this.resizeHandle.style.visibility = "visible";
        this.slider.show();
    }
}
//# sourceMappingURL=scrollingPanel.js.map