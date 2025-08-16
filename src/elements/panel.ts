import { isInMainWindow, selectedElement, setSelectedElement } from "../index.js";
import { config } from "../CONFIG.js";
import { updatePropertiesArea } from "../ui/propertiesArea.js";
import { AllJsonUIElements } from "./elements.js";
import { Binding } from "../scripter/bindings/types.js";

export class DraggablePanel {
    public container: HTMLElement;
    public panel: HTMLElement;
    public resizeHandle: HTMLElement;
    public isDragging: boolean;
    public isResizing: boolean;
    public selected: boolean;
    public offsetX: number;
    public offsetY: number;
    public resizeStartWidth?: number;
    public resizeStartHeight?: number;
    public resizeStartX?: number;
    public resizeStartY?: number;

    public bindings: string = "[]";
    /**
     * @param {HTMLElement} container
     */
    public constructor(ID: string, container: HTMLElement) {
        let lastParent: HTMLElement | null = container;
        let i: number = 0;
        parent_loop: while (true) {
            if (!lastParent) break parent_loop;
            lastParent = lastParent.parentElement;
            i++;
        }

        // Saves parameters
        (this as any)._constructorArgs = [ID, container];

        this.container = container;
        this.panel = document.createElement("div");
        this.panel.classList.add("draggable-panel"); // Needs to be added before gridable
        this.panel.classList.add("gridable");

        // Custom data
        this.panel.dataset.id = ID;

        const rect: DOMRect = container.getBoundingClientRect();

        this.panel.style.height = `${rect.height * 0.8}px`;
        this.panel.style.width = `${rect.width * 0.8}px`;

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
        this.grid(config.settings.show_grid.value);
    }

    public initEvents(): void {
        this.panel.addEventListener("mousedown", (e) => this.startDrag(e));
        this.panel.addEventListener("dblclick", (e) => this.select(e));
        document.addEventListener("mousemove", (e) => this.drag(e));
        document.addEventListener("mouseup", () => this.stopDrag());

        this.resizeHandle.addEventListener("mousedown", (e) => this.startResize(e));
        document.addEventListener("mousemove", (e) => this.resize(e));
        document.addEventListener("mouseup", () => this.stopResize());
    }

    public select(e: MouseEvent): void {
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
        this.grid(config.settings.show_grid.value);
    }

    public unSelect(_e?: MouseEvent): void {
        this.selected = false;
        setSelectedElement(undefined);
        this.panel.style.border = "2px solid black";
        this.panel.style.outline = "2px solid black";

        updatePropertiesArea();
        this.grid(false);
    }

    public startDrag(e: MouseEvent): void {
        if (e.target === this.resizeHandle) return;

        // Stop propagation for nested elements
        for (let elementName of AllJsonUIElements) {
            if (this.container.classList.contains(elementName)) {
                e.stopPropagation();
            }
        }

        this.isDragging = true;

        // Get position relative to parent container
        const panelRect: DOMRect = this.panel.getBoundingClientRect();

        this.offsetX = e.clientX - panelRect.left;
        this.offsetY = e.clientY - panelRect.top;

        this.panel.style.cursor = "grabbing";
    }

    public drag(e: MouseEvent): void {
        e.stopPropagation();
        if (!this.isDragging || this.isResizing) return;
        const containerRect: DOMRect = this.container.getBoundingClientRect();

        if (config.settings.boundary_constraints!.value) {
            let newLeft: number = e.clientX - containerRect.left - this.offsetX;
            let newTop: number = e.clientY - containerRect.top - this.offsetY;

            // Constrain to container bounds
            newLeft = Math.max(0, Math.min(newLeft, containerRect.width - this.panel.offsetWidth));
            newTop = Math.max(0, Math.min(newTop, containerRect.height - this.panel.offsetHeight));

            this.panel.style.left = `${newLeft}px`;
            this.panel.style.top = `${newTop}px`;
        } else {
            // Calculate position relative to parent container
            const newLeft: number = e.clientX - containerRect.left - this.offsetX;
            const newTop: number = e.clientY - containerRect.top - this.offsetY;

            this.panel.style.left = `${newLeft}px`;
            this.panel.style.top = `${newTop}px`;
        }
    }

    public stopDrag(): void {
        this.isDragging = false;
        this.panel.style.cursor = "grab";

        if (isInMainWindow) updatePropertiesArea();
    }

    public startResize(e: MouseEvent): void {
        e.stopPropagation(); // Prevent event from bubbling to parent
        this.isResizing = true;
        this.resizeStartWidth = parseFloat(this.panel.style.width);
        this.resizeStartHeight = parseFloat(this.panel.style.height);
        this.resizeStartX = e.clientX;
        this.resizeStartY = e.clientY;
        e.preventDefault();
    }

    public resize(e: MouseEvent): void {
        if (!this.isResizing) return;
        e.stopPropagation(); // Prevent event from bubbling to parent

        const widthChange: number = e.clientX - this.resizeStartX!;
        const heightChange: number = e.clientY - this.resizeStartY!;

        this.panel.style.width = `${this.resizeStartWidth! + widthChange}px`;
        this.panel.style.height = `${this.resizeStartHeight! + heightChange}px`;
    }

    public stopResize(): void {
        this.isResizing = false;
        if (isInMainWindow) updatePropertiesArea();
    }


    public getMainHTMLElement(): HTMLElement {
        return this.panel;
    }

    public delete(): void {

        if (this.selected) this.unSelect();

        this.container.removeChild(this.getMainHTMLElement());

        document.removeEventListener("mousemove", (e) => this.drag(e));
        document.removeEventListener("mouseup", () => this.stopDrag());
        document.removeEventListener("mousemove", (e) => this.resize(e));
        document.removeEventListener("mouseup", () => this.stopResize());
    }

    public grid(showGrid: boolean): void {
        const element = this.getMainHTMLElement();

        if (!showGrid) {
            element.style.removeProperty('--grid-cols');
            element.style.removeProperty('--grid-rows');    
        }

        else {
            element.style.setProperty('--grid-cols', String(config.settings.grid_lock_columns.value));
            element.style.setProperty('--grid-rows', String(config.settings.grid_lock_rows.value));
        }
    }
}

