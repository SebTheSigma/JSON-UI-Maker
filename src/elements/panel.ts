import { selectedElement, setSelectedElement } from "../index.js";
import { config } from "../CONFIG.js";

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
    /**
     * @param {HTMLElement} container
     */
    public constructor(container: HTMLElement) {
        let lastParent: HTMLElement | null = container;
        let i: number = 0;
        parent_loop: while (true) {
            if (!lastParent) break parent_loop;
            lastParent = lastParent.parentElement;
            i++;
        }

        this.container = container;
        this.panel = document.createElement("div");
        this.panel.className = "draggable-panel";

        const rect: DOMRect = container.getBoundingClientRect();

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

        console.log(this.selected);

        if (selectedElement) {
            if (selectedElement !== this.panel) {
                selectedElement.style.border = "2px solid black";
                this.selected = true;
                setSelectedElement(this.panel);
                this.panel.style.border = "2px solid blue";
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
    }

    public unSelect(_e?: MouseEvent): void {
        this.selected = false;
        setSelectedElement(undefined);
        this.panel.style.border = "2px solid black";
    }

    public startDrag(e: MouseEvent): void {
        if (e.target === this.resizeHandle) return;

        // Stop propagation for nested panels
        if (this.container.classList.contains("draggable-panel")) {
            e.stopPropagation();
        }

        this.isDragging = true;

        // Get position relative to parent container
        const panelRect: DOMRect = this.panel.getBoundingClientRect();

        this.offsetX = e.clientX - panelRect.left;
        this.offsetY = e.clientY - panelRect.top;

        this.panel.style.cursor = "grabbing";
    }

    public drag(e: MouseEvent): void {
        if (!this.isDragging || this.isResizing) return;
        const containerRect: DOMRect = this.container.getBoundingClientRect();

        if (config.settings.boundary_constraints!.value) {
            console.log("Boudary");
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
    }
}