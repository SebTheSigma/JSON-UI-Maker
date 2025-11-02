import { images, panelContainer } from "../index.js";
import { Nineslice, NinesliceData } from "../nineslice.js";
import { config } from "../CONFIG.js";
import { keyboardEvent } from "../keyboard/eventListeners.js";
import { StringUtil } from "../util/stringUtil.js";
import { ElementSharedFuncs } from "./sharedElement.js";
import { GeneralUtil } from "../util/generalUtil.js";
import { ExplorerController } from "../ui/explorer/explorerController.js";

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
    public gridElement: HTMLElement;
    public centerCircle?: HTMLElement;

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
    public constructor(ID: string, container: HTMLElement, imageData: ImageData, imagePath: string, nineSlice?: NinesliceData) {
        const i = GeneralUtil.getElementDepth(container, panelContainer);

        // Saves parameters
        (this as any)._constructorArgs = [ID, container, imageData, imagePath, nineSlice];

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
        this.canvasHolder.dataset.imagePath = imagePath;
        this.canvasHolder.dataset.id = ID;
        this.canvasHolder.style.position = "absolute";

        // Creates the canvas and puts it in the canvas holder
        this.canvas = document.createElement("canvas");
        this.canvas.style.zIndex = String(i * 2);

        // Draws the image
        const ctx: CanvasRenderingContext2D = this.canvas.getContext("2d")!;
        ctx.putImageData(this.imageData, 0, 0);

        // Always fits the image into the parent container
        if (rect.width > rect.height) {
            const scaledHeight: number = rect.height * 0.8;
            this.drawImage(scaledHeight * this.aspectRatio, scaledHeight, true);
        } else if (rect.width <= rect.height) {
            const scaledWidth: number = rect.width * 0.8;
            this.drawImage(scaledWidth, scaledWidth / this.aspectRatio, true);
        }

        this.canvasHolder.style.left = `${rect.width / 2 - parseFloat(this.canvas.style.width) / 2}px`;
        this.canvasHolder.style.top = `${rect.height / 2 - parseFloat(this.canvas.style.height) / 2}px`;

        // Creates a resize handle and adds it to the canvas holder as a sibling to the canvas
        this.resizeHandle = document.createElement("div");
        this.resizeHandle.className = "resize-handle";
        this.resizeHandle.style.zIndex = String(2 * i + 1);

        this.outlineDiv = document.createElement("div");
        this.outlineDiv.className = "outline-div";
        this.outlineDiv.classList.add("body-attched");
        this.outlineDiv.style.outline = "3px dotted rgb(0, 0, 0)";
        this.outlineDiv.style.position = "absolute";
        this.outlineDiv.style.zIndex = "1000";

        this.gridElement = ElementSharedFuncs.generateGridElement();
        this.gridElement.style.top = `0px`;

        this.centerCircle = ElementSharedFuncs.generateCenterPoint();

        this.canvasHolder.appendChild(this.canvas);
        this.canvasHolder.appendChild(this.resizeHandle);
        this.canvasHolder.appendChild(this.gridElement);
        this.canvasHolder.appendChild(this.centerCircle);
        this.container.appendChild(this.canvasHolder);
        document.body.appendChild(this.outlineDiv);

        this.initEvents();
        this.grid(false);

        ElementSharedFuncs.updateCenterCirclePosition(this);
        setTimeout(() => {
            ExplorerController.updateExplorer();
        }, 0);
    }

    public initEvents(): void {

        // Using the grid element as a drag target, i cant seem
        // to get the canvas to accept input through the grid so this is a workaround
        this.gridElement.addEventListener("mousedown", (e) => this.startDrag(e));
        this.gridElement.addEventListener("dblclick", (e) => this.select(e));

        this.resizeHandle.addEventListener("mousedown", (e) => this.startResize(e));
    }

    public select(e: MouseEvent): void {
        if (!this.isEditable) return;
        ElementSharedFuncs.select(e, this);
    }

    public unSelect(_e?: MouseEvent): void {
        if (!this.isEditable) return;
        ElementSharedFuncs.unSelect(this);
    }

    public startDrag(e: MouseEvent): void {
        if (e.target === this.resizeHandle || !this.isEditable) return;
        this.outlineDiv.style.display = "none";
        if (this.isResizing) this.stopResize(e, false);

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
        e.stopPropagation(); // Prevent event from bubbling to parent
        if (!this.isEditable) return;

        ElementSharedFuncs.startResize(e, this, false); // False because propagation is already called

        const rect = this.canvasHolder.getBoundingClientRect();
        this.outlineDiv.style.top = `${rect.top + window.scrollY}px`;
        this.outlineDiv.style.left = `${rect.left + window.scrollX}px`;
        this.outlineDiv.style.display = "block";
    }

    public confirmResize(e: MouseEvent): void {
        if (!this.isResizing || !this.isEditable) return;
        e.stopPropagation(); // Prevent event from bubbling to parent

        const outlineWidth = StringUtil.cssDimToNumber(this.outlineDiv.style.outlineWidth);
        const newWidth: number = (this.outlineDiv.style.width ? StringUtil.cssDimToNumber(this.outlineDiv.style.width) : 0) + outlineWidth;
        const newHeight: number = (this.outlineDiv.style.height ? StringUtil.cssDimToNumber(this.outlineDiv.style.height) : 0) + outlineWidth;

        this.drawImage(newWidth, newHeight);
        ElementSharedFuncs.updateCenterCirclePosition(this);
    }

    public resize(e: MouseEvent): void {
        if (!this.isResizing || !this.isEditable) return;
        e.stopPropagation(); // Prevent event from bubbling to parent
        const containerRect: DOMRect = this.container.getBoundingClientRect();

        const widthChange: number = e.clientX - this.resizeStartX!;
        const heightChange: number = e.clientY - this.resizeStartY!;

        let newWidth: number = this.resizeStartWidth! + widthChange;
        let newHeight: number = this.resizeStartHeight! + heightChange;
        const maxWidth: number = containerRect.width - parseFloat(this.canvasHolder.style.left);
        const maxHeight: number = containerRect.height - parseFloat(this.canvasHolder.style.top);

        // If shift key is pressed, maintain aspect ratio,
        // only if the image is a 9-slice
        if (!this.nineSlice) {
            newHeight = newWidth / this.aspectRatio;
        }

        else if (keyboardEvent?.shiftKey) {
            if (newHeight > newWidth) {
                newWidth = newHeight;
            } else {
                newHeight = newWidth;
            }
        }

        const outlineWidth = StringUtil.cssDimToNumber(this.outlineDiv.style.outlineWidth);
        if (config.settings.boundary_constraints!.value) {

            if (!this.nineSlice) {
                // Adjust width and height proportionally
                if (newWidth > maxWidth || newHeight > maxHeight) {
                    if (newWidth / maxWidth > newHeight / maxHeight) {
                        newWidth = maxWidth;
                        newHeight = newWidth / this.aspectRatio;
                    }

                    else {
                        newHeight = maxHeight;
                        newWidth = newHeight * this.aspectRatio;
                    }
                }
            }

            this.outlineDiv.style.width = `${Math.max(0, Math.min(newWidth, maxWidth)) - outlineWidth}px`;
            this.outlineDiv.style.height = `${Math.max(0, Math.min(newHeight, maxHeight)) - outlineWidth}px`;
        } else {
            this.outlineDiv.style.width = `${newWidth - outlineWidth}px`;
            this.outlineDiv.style.height = `${newHeight - outlineWidth}px`;
        }
    }

    public stopResize(e?: MouseEvent, shouldResize: boolean = true): void {
        if (shouldResize) this.confirmResize(e!);

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

    public changeImage(imagePath: string): void {
        const data = images.get(imagePath);

        // Checks if the image is there
        if (!data || !data.png) return;

        // Sets pixel data
        this.imageData = data.png;

        // Re-calculates aspect ratio
        this.aspectRatio = this.imageData.width / this.imageData.height;

        // Sets nineslice
        this.nineSlice = undefined;
        this.nineSlice = data.json;

        this.canvasHolder.dataset.imagePath = imagePath;
        this.drawImage(this.canvas.width, this.canvas.height, true);

        ElementSharedFuncs.updateCenterCirclePosition(this);
    }

    public setParse(shouldParse: boolean): void {
        this.canvasHolder.dataset.shouldParse = `${shouldParse}`.toLowerCase();
    }

    public detatchAllEvents(): void {
        this.canvas.removeEventListener("mousedown", (e) => this.startDrag(e));
        this.canvas.removeEventListener("dblclick", (e) => this.select(e));

        this.resizeHandle.removeEventListener("mousedown", (e) => this.startResize(e));
    }

    public detach(): void {}

    public getMainHTMLElement(): HTMLElement {
        return this.canvasHolder;
    }

    public editable(isEditable: boolean): void {
        if (!isEditable) {
            this.stopDrag();
            this.stopResize(undefined, false);
            this.detatchAllEvents();

            if (this.selected) this.unSelect();
        } else {
            this.initEvents();
        }

        this.resizeHandle.style.display = isEditable ? "block" : "none";
        this.canvasHolder.style.outline = isEditable ? `${config.settings.element_outline.value}px solid black` : "none";

        this.isEditable = isEditable;
    }

    public delete(): void {
        if (!this.deleteable) return;
        if (this.selected) this.unSelect();

        this.container.removeChild(this.getMainHTMLElement());
        document.body.removeChild(this.outlineDiv);
    }

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
