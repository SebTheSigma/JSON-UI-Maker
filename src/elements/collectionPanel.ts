import { isInMainWindow, panelContainer, selectedElement, setSelectedElement } from "../index.js";
import { config } from "../CONFIG.js";
import { updatePropertiesArea } from "../ui/propertiesArea.js";
import { AllJsonUIElements } from "./elements.js";
import { ElementSharedFuncs } from "./sharedElement.js";
import { GeneralUtil } from "../util/generalUtil.js";
import { ExplorerController } from "../ui/explorer/explorerController.js";

export class DraggableCollectionPanel {
    // Core elements
    public container: HTMLElement;
    public panel: HTMLElement;
    public resizeHandle: HTMLElement;
    public gridElement: HTMLElement;
    public centerCircle?: HTMLElement;

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
    public constructor(ID: string, container: HTMLElement, collectionName: string = config.defaultCollectionName) {
        const i = GeneralUtil.getElementDepth(container, panelContainer);

        // Saves parameters
        (this as any)._constructorArgs = [ID, container, collectionName];

        this.container = container;

        const rect: DOMRect = container.getBoundingClientRect();

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
        setTimeout(() => {
            ExplorerController.updateExplorer();
        }, 0);
    }

    public initEvents(): void {
        this.panel.addEventListener("mousedown", (e) => this.startDrag(e));
        this.panel.addEventListener("dblclick", (e) => this.select(e));

        this.resizeHandle.addEventListener("mousedown", (e) => this.startResize(e));
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
        this.centerCircle!.style.display = "block";
    }

    public drag(e: MouseEvent): void {
        ElementSharedFuncs.drag(e, this);
    }

    public stopDrag(): void {
        ElementSharedFuncs.stopDrag(this);
        this.centerCircle!.style.display = "none";
    }

    public startResize(e: MouseEvent): void {
        ElementSharedFuncs.startResize(e, this);
    }

    public resize(e: MouseEvent): void {
        if (!this.isResizing) return;
        ElementSharedFuncs.resize(e, this);
        ElementSharedFuncs.updateCenterCirclePosition(this);
    }

    public stopResize(): void {
        ElementSharedFuncs.stopResize(this);
    }

    public getMainHTMLElement(): HTMLElement {
        return this.panel;
    }

    public delete(): void {
        if (!this.deleteable) return;
        if (this.selected) this.unSelect();

        this.container.removeChild(this.getMainHTMLElement());
    }

    public detach(): void {}

    public grid(showGrid: boolean): void {
        ElementSharedFuncs.grid(showGrid, this);
    }

    public hide(): void {
        ElementSharedFuncs.hide(this);
    }

    public show(): void {
        ElementSharedFuncs.show(this);
    }
}
