import { isInMainWindow, panelContainer, selectedElement, setSelectedElement } from "../index.js";
import { config } from "../CONFIG.js";
import { updatePropertiesArea } from "../ui/propertiesArea.js";
import { AllJsonUIElements } from "./elements.js";
import { MinecraftSlider } from "../ui/sliders/addMinecraftSlider.js";
import { ElementSharedFuncs } from "./sharedElement.js";
import { GeneralUtil } from "../util/generalUtil.js";
import { ExplorerController } from "../ui/explorer/explorerController.js";

export class DraggableScrollingPanel {
    // Core elements
    public container: HTMLElement;
    public basePanel: HTMLElement;
    public panel: HTMLElement;
    public resizeHandle: HTMLElement;
    public slider: MinecraftSlider;

    // State flags
    public isDragging: boolean = false;
    public isResizing: boolean = false;
    public selected: boolean = false;
    public deleteable: boolean = true;

    // Positioning & movement
    public offsetX: number = 0;
    public offsetY: number = 0;

    // Resize state
    public resizeStartWidth?: number;
    public resizeStartHeight?: number;
    public resizeStartX?: number;
    public resizeStartY?: number;
    public resizeStartLeft?: number;
    public resizeStartTop?: number;

    // Data
    public bindings: string = "";
    /**
     * @param {HTMLElement} container
     */
    public constructor(ID: string, container: HTMLElement) {
        const i = GeneralUtil.getElementDepth(container, panelContainer);

        // Saves parameters
        (this as any)._constructorArgs = [ID, container];

        this.container = container;

        const rect: DOMRect = container.getBoundingClientRect();

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

    public initEvents(): void {
        this.panel.addEventListener("mousedown", (e) => this.startDrag(e));
        this.panel.addEventListener("dblclick", (e) => this.select(e));

        this.resizeHandle.addEventListener("mousedown", (e) => this.startResize(e));

        this.panel.addEventListener("scroll", () => this.slider.updateHandle());
    }

    public select(e: MouseEvent): void {
        ElementSharedFuncs.select(e, this);
    }

    public unSelect(_e?: MouseEvent): void {
        ElementSharedFuncs.unSelect(this);
    }

    public startDrag(e: MouseEvent): void {
        if (e.target === this.resizeHandle) return;
        ElementSharedFuncs.startDrag(e, this);
    }

    public drag(e: MouseEvent): void {
        ElementSharedFuncs.drag(e, this, this.basePanel);
    }

    public stopDrag(): void {
        ElementSharedFuncs.stopDrag(this);
    }

    public startResize(e: MouseEvent): void {
        this.slider.setMoveType("instant");
        ElementSharedFuncs.startResize(e, this);
    }

    public resize(e: MouseEvent): void {
        if (!this.isResizing) return;
        this.slider.updateHandle();

        ElementSharedFuncs.resize(e, this);

        this.basePanel.style.width = this.panel.style.width;
        this.basePanel.style.height = this.panel.style.height;
    }

    public stopResize(): void {
        this.slider.setMoveType("smooth");

        ElementSharedFuncs.stopResize(this);
    }

    public getMainHTMLElement(): HTMLElement {
        return this.panel;
    }

    public delete(): void {
        if (!this.deleteable) return;
        if (this.selected) this.unSelect();

        this.container.removeChild(this.basePanel);
        this.slider.delete();

        this.panel.removeEventListener("scroll", () => this.slider.updateHandle());
    }

    public detach(): void {}

    public hide(): void {
        this.panel.style.outline = "0px solid black";
        this.resizeHandle.style.visibility = "hidden";
        this.slider.hide();
    }

    public show(): void {
        this.panel.style.outline = `${config.settings.element_outline.value}px solid black`;
        this.resizeHandle.style.visibility = "visible";
        this.slider.show();
    }
}
