import { images, isInMainWindow, panelContainer, selectedElement, setSelectedElement } from "../index.js";
import { Nineslice, NinesliceData } from "../nineslice.js";
import { config } from "../CONFIG.js";
import { keyboardEvent } from "../keyboard/eventListeners.js";
import { updatePropertiesArea } from "../ui/propertiesArea.js";
import { AllJsonUIElements } from "./elements.js";
import { StringUtil } from "../util/stringUtil.js";
import { ElementSharedFuncs } from "./sharedElement.js";
import { GeneralUtil } from "../util/generalUtil.js";

export class DraggableCanvas {
    // Core data
    public imageData: ImageData;
    public nineSlice?: NinesliceData;

    // Core elements
    public container: HTMLElement;
    public outlineDiv: HTMLDivElement;
    public canvasHolder: HTMLDivElement;
    public canvas: HTMLCanvasElement;
    public resizeHandle: HTMLDivElement;

    // Display
    public aspectRatio: number;

    // State flags
    public isDragging: boolean = false;
    public isResizing: boolean = false;
    public selected: boolean = false;
    public deleteable: boolean = true;
    public isEditable: boolean = true;

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
    public constructor(ID: string, container: HTMLElement, imageData: ImageData, imageName: string, nineSlice?: NinesliceData) {
        const i = GeneralUtil.getElementDepth(container, panelContainer);

        // Saves parameters
        (this as any)._constructorArgs = [ID, container, imageData, imageName, nineSlice];

        this.imageData = imageData;
        this.aspectRatio = imageData.width / imageData.height;
        this.nineSlice = nineSlice;
        this.container = container;

        const rect: DOMRect = container.getBoundingClientRect();

        // Holds the element in a div
        this.canvasHolder = document.createElement("div");
        this.canvasHolder.style.width = `${imageData.width}px`;
        this.canvasHolder.style.height = `${imageData.height}px`;
        this.canvasHolder.className = "draggable-canvas";
        this.canvasHolder.style.zIndex = String(i * 2);
        this.canvasHolder.style.visibility = "visible";
        this.canvasHolder.dataset.imageName = imageName;
        this.canvasHolder.dataset.id = ID;
        this.canvasHolder.style.position = "absolute";

        // Creates the canvas and puts it in the canvas holder
        this.canvas = document.createElement("canvas");
        this.canvas.style.zIndex = String(2 * i);

        // Draws the image
        const ctx: CanvasRenderingContext2D = this.canvas.getContext("2d")!;
        ctx.putImageData(this.imageData, 0, 0);

        // Always fits the image into the parent container
        if (rect.width > rect.height) {
            const scaledHeight: number = rect.height * 0.8;
            this.drawImage(scaledHeight * this.aspectRatio, scaledHeight);
        } else if (rect.width <= rect.height) {
            const scaledWidth: number = rect.width * 0.8;
            this.drawImage(scaledWidth, scaledWidth / this.aspectRatio);
        }

        this.canvasHolder.style.left = `${rect.width / 2 - parseFloat(this.canvas.style.width) / 2}px`;
        this.canvasHolder.style.top = `${rect.height / 2 - parseFloat(this.canvas.style.height) / 2}px`;

        // Creates a resize handle and adds it to the canvas holder as a sibling to the canvas
        this.resizeHandle = document.createElement("div");
        this.resizeHandle.className = "resize-handle";
        this.resizeHandle.style.zIndex = String(2 * i + 1);
        this.resizeHandle.style.top = "-15px";

        this.outlineDiv = document.createElement("div");
        this.outlineDiv.className = "outline-div";
        this.outlineDiv.style.border = "3px dotted rgb(0, 0, 0)";
        this.outlineDiv.style.position = "absolute";
        this.outlineDiv.style.zIndex = "1000";

        this.canvasHolder.appendChild(this.canvas);
        this.canvasHolder.appendChild(this.resizeHandle);
        this.container.appendChild(this.canvasHolder);
        document.body.appendChild(this.outlineDiv);

        this.initEvents();
        this.grid(config.settings.show_grid.value);
    }

    public initEvents(): void {
        this.canvas.addEventListener("mousedown", (e) => this.startDrag(e));
        this.canvas.addEventListener("dblclick", (e) => this.select(e));
        document.addEventListener("mousemove", (e) => this.drag(e));
        document.addEventListener("mouseup", () => this.stopDrag());

        this.resizeHandle.addEventListener("mousedown", (e) => this.startResize(e));
        document.addEventListener("mousemove", (e) => this.outlineResize(e));
        document.addEventListener("mouseup", (e) => this.resize(e));
        document.addEventListener("mouseup", () => this.stopResize());
    }

    public select(e: MouseEvent): void {
        if (!this.isEditable) return;
        e.stopPropagation(); // Prevent the event from bubbling up to the parent

        if (selectedElement) {
            if (selectedElement !== this.canvasHolder) {
                selectedElement.style.border = "2px solid black";
                selectedElement.style.outline = "2px solid black";
                this.selected = true;
                setSelectedElement(this.canvasHolder);
                this.canvasHolder.style.border = "2px solid blue";
                this.canvasHolder.style.outline = "2px solid blue";
                updatePropertiesArea();
                return;
            }
        }

        if (this.selected) {
            this.unSelect(e);
            return;
        }

        this.selected = true;
        setSelectedElement(this.canvasHolder);
        this.canvasHolder.style.border = "2px solid blue";
        this.canvasHolder.style.outline = "2px solid blue";

        updatePropertiesArea();
        this.grid(config.settings.show_grid.value);
    }

    public unSelect(_e?: MouseEvent): void {
        if (!this.isEditable) return;
        this.selected = false;
        setSelectedElement(undefined);
        this.canvasHolder.style.border = "2px solid black";
        this.canvasHolder.style.outline = "2px solid black";
        updatePropertiesArea();
        this.grid(false);
    }

    public startDrag(e: MouseEvent): void {
        // Stop propagation for nested elements
        for (let elementName of AllJsonUIElements) {
            if (this.container.classList.contains(elementName)) {
                e.stopPropagation();
            }
        }

        if (e.target === this.resizeHandle || !this.isEditable) return;

        this.outlineDiv.style.display = "none";
        if (this.isResizing) this.stopResize();

        this.isDragging = true;

        // Get position relative to parent container
        const canvasRect: DOMRect = this.canvasHolder.getBoundingClientRect();

        this.offsetX = e.clientX - canvasRect.left;
        this.offsetY = e.clientY - canvasRect.top;

        this.canvas.style.cursor = "grabbing";
    }

    public drag(e: MouseEvent): void {
        if (!this.isDragging || this.isResizing || !this.isEditable) return;
        const containerRect: DOMRect = this.container.getBoundingClientRect();

        if (config.settings.boundary_constraints!.value) {
            let newLeft: number = e.clientX - containerRect.left - this.offsetX;
            let newTop: number = e.clientY - containerRect.top - this.offsetY;

            // Constrain to container bounds
            newLeft = Math.max(0, Math.min(newLeft, containerRect.width - Number(this.canvasHolder.style.width.replace("px", ""))));
            newTop = Math.max(0, Math.min(newTop, containerRect.height - Number(this.canvasHolder.style.height.replace("px", ""))));

            this.canvasHolder.style.left = `${newLeft}px`;
            this.canvasHolder.style.top = `${newTop}px`;
        } else {
            // Calculate position relative to parent container
            const newLeft: number = e.clientX - containerRect.left - this.offsetX;
            const newTop: number = e.clientY - containerRect.top - this.offsetY;

            this.canvasHolder.style.left = `${newLeft}px`;
            this.canvasHolder.style.top = `${newTop}px`;
        }
    }

    public stopDrag(): void {
        this.isDragging = false;
        this.canvas.style.cursor = "grab";
        if (isInMainWindow) updatePropertiesArea();
    }

    public startResize(e: MouseEvent): void {
        e.stopPropagation(); // Prevent event from bubbling to parent
        if (!this.isEditable) return;

        ElementSharedFuncs.startResize(e, this, false); // False because propagation is already called

        const rect = this.canvasHolder.getBoundingClientRect();
        this.outlineDiv.style.top = `${rect.top + window.scrollY}px`;
        this.outlineDiv.style.left = `${rect.left + window.scrollX}px`;
        this.outlineDiv.style.display = "block";
    }

    public resize(e: MouseEvent): void {
        e.stopPropagation(); // Prevent event from bubbling to parent
        if (!this.isResizing || !this.isEditable) return;
        const containerRect: DOMRect = this.container.getBoundingClientRect();

        const widthChange: number = e.clientX - this.resizeStartX!;
        const heightChange: number = e.clientY - this.resizeStartY!;

        let newWidth: number = this.resizeStartWidth! + widthChange;
        let newHeight: number = this.resizeStartHeight! + heightChange;

        // If shift key is pressed, maintain aspect ratio,
        // only if the image is a 9-slice
        if (!this.nineSlice) {
            newHeight = newWidth / this.aspectRatio;

            if (config.settings.boundary_constraints!.value) {
                // Determine the maximum possible width while maintaining aspect ratio
                const maxWidth: number = containerRect.width - parseFloat(this.canvasHolder.style.left);
                const maxHeight: number = containerRect.height - parseFloat(this.canvasHolder.style.top);

                // Adjust width and height proportionally
                if (newWidth > maxWidth || newHeight > maxHeight) {
                    if (newWidth / maxWidth > newHeight / maxHeight) {
                        newWidth = maxWidth;
                        newHeight = newWidth / this.aspectRatio;
                    } else {
                        newHeight = maxHeight;
                        newWidth = newHeight * this.aspectRatio;
                    }
                }
            }
        } else if (keyboardEvent?.shiftKey) {
            if (newHeight > newWidth) {
                newWidth = newHeight;
            } else {
                newHeight = newWidth;
            }
        }

        this.drawImage(newWidth, newHeight);
    }

    public outlineResize(e: MouseEvent): void {
        e.stopPropagation(); // Prevent event from bubbling to parent
        if (!this.isResizing || !this.isEditable) return;
        const containerRect: DOMRect = this.container.getBoundingClientRect();

        const widthChange: number = e.clientX - this.resizeStartX!;
        const heightChange: number = e.clientY - this.resizeStartY!;

        let newWidth: number = this.resizeStartWidth! + widthChange;
        let newHeight: number = this.resizeStartHeight! + heightChange;

        // If shift key is pressed, maintain aspect ratio,
        // only if the image is a 9-slice
        if (!this.nineSlice) {
            newHeight = newWidth / this.aspectRatio;

            if (config.settings.boundary_constraints!.value) {
                // Determine the maximum possible width while maintaining aspect ratio
                const maxWidth: number = containerRect.width - parseFloat(this.canvasHolder.style.left);
                const maxHeight: number = containerRect.height - parseFloat(this.canvasHolder.style.top);

                // Adjust width and height proportionally
                if (newWidth > maxWidth || newHeight > maxHeight) {
                    if (newWidth / maxWidth > newHeight / maxHeight) {
                        newWidth = maxWidth;
                        newHeight = newWidth / this.aspectRatio;
                    } else {
                        newHeight = maxHeight;
                        newWidth = newHeight * this.aspectRatio;
                    }
                }
            }
        } else if (keyboardEvent?.shiftKey) {
            if (newHeight > newWidth) {
                newWidth = newHeight;
            } else {
                newHeight = newWidth;
            }
        }

        this.outlineDiv.style.width = `${newWidth - StringUtil.cssDimToNumber(this.outlineDiv.style.borderWidth)}px`;
        this.outlineDiv.style.height = `${newHeight - StringUtil.cssDimToNumber(this.outlineDiv.style.borderWidth)}px`;
    }

    public stopResize(): void {
        this.outlineDiv.style.display = "none";
        ElementSharedFuncs.stopResize(this);
    }

    /**
     *
     * @param {number} width
     * @param {number} height
     */
    public drawImage(width: number, height: number, _updateImage: boolean = false): void {
        width = Math.floor(width);
        height = Math.floor(height);

        // Stops the canvas from being too small
        if (width <= 1) width = 1;
        if (height <= 1) height = 1;

        const ctx: CanvasRenderingContext2D = this.canvas.getContext("2d")!;

        if (this.nineSlice) {
            const pixels: Uint8ClampedArray<ArrayBuffer> = Nineslice.ninesliceResize(this.nineSlice, this.imageData.data, width, height);

            this.canvas.width = width;
            this.canvas.height = height;

            const newImageData: ImageData = new ImageData(pixels, width, height, { colorSpace: this.imageData.colorSpace });

            // Draws the image
            ctx.putImageData(newImageData, 0, 0);
        }

        // **Scale the display size (but keep internal resolution high)**
        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;

        // Optional: Center the canvas if needed
        this.canvas.style.display = "block";
        this.canvas.style.margin = "0 auto";

        this.canvasHolder.style.width = `${width}px`;
        this.canvasHolder.style.height = `${height}px`;

        if (_updateImage) {
            this.canvas.width = this.imageData.width;
            this.canvas.height = this.imageData.height;

            const rect: DOMRect = this.container.getBoundingClientRect();

            ctx.putImageData(this.imageData, 0, 0);

            if (rect.width > rect.height) {
                const scaledHeight: number = rect.height * 0.8;
                this.drawImage(scaledHeight * this.aspectRatio, scaledHeight, false);
            } else if (rect.width <= rect.height) {
                const scaledWidth: number = rect.width * 0.8;
                this.drawImage(scaledWidth, scaledWidth / this.aspectRatio, false);
            }
        }
    }

    public changeImage(imageName: string): void {
        const data = images.get(imageName);

        // Checks if the image is there
        if (!data || !data.png) return;

        // Sets pixel data
        this.imageData = data.png;

        // Re-calculates aspect ratio
        this.aspectRatio = this.imageData.width / this.imageData.height;

        // Sets nineslice
        this.nineSlice = undefined;
        this.nineSlice = data.json;

        this.canvasHolder.dataset.imageName = imageName;
        this.drawImage(this.canvas.width, this.canvas.height, true);
    }

    public setParse(shouldParse: boolean): void {
        this.canvasHolder.dataset.shouldParse = `${shouldParse}`.toLowerCase();
    }

    public detatchEvents(): void {
        this.canvas.removeEventListener("mousedown", (e) => this.startDrag(e));
        this.canvas.removeEventListener("dblclick", (e) => this.select(e));
        document.removeEventListener("mousemove", (e) => this.drag(e));
        document.removeEventListener("mouseup", () => this.stopDrag());

        this.resizeHandle.removeEventListener("mousedown", (e) => this.startResize(e));
        document.removeEventListener("mousemove", (e) => this.outlineResize(e));
        document.removeEventListener("mouseup", (e) => this.resize(e));
        document.removeEventListener("mouseup", () => this.stopResize());
    }

    public getMainHTMLElement(): HTMLElement {
        return this.canvasHolder;
    }

    public editable(isEditable: boolean): void {
        if (!isEditable) {
            this.stopDrag();
            this.stopResize();
            this.detatchEvents();

            if (this.selected) this.unSelect();
        } else {
            this.initEvents();
        }

        this.resizeHandle.style.display = isEditable ? "block" : "none";
        this.canvasHolder.style.outline = isEditable ? "2px solid black" : "none";
        this.canvasHolder.style.border = isEditable ? "2px solid black" : "none";

        this.isEditable = isEditable;
    }

    public delete(): void {
        if (!this.deleteable) return;
        if (this.selected) this.unSelect();

        this.container.removeChild(this.getMainHTMLElement());
        document.body.removeChild(this.outlineDiv);

        document.removeEventListener("mousemove", (e) => this.drag(e));
        document.removeEventListener("mouseup", () => this.stopDrag());
        document.removeEventListener("mousemove", (e) => this.outlineResize(e));
        document.removeEventListener("mouseup", (e) => this.resize(e));
        document.removeEventListener("mouseup", () => this.stopResize());
    }

    public grid(showGrid: boolean): void {
        const element = this.getMainHTMLElement();

        if (!showGrid) {
            element.style.removeProperty("--grid-cols");
            element.style.removeProperty("--grid-rows");
        } else {
            element.style.setProperty("--grid-cols", String(config.settings.grid_lock_columns.value));
            element.style.setProperty("--grid-rows", String(config.settings.grid_lock_rows.value));
        }
    }
}
