import { selectedElement, setSelectedElement } from "../index.js";
import { Nineslice, NinesliceData } from "../nineslice.js";
import { config } from "../CONFIG.js";
import { keyboardEvent } from "../keyboard/eventListeners.js";

export class DraggableCanvas {
    public imageData: ImageData;
    public nineSlice?: NinesliceData;
    public container: HTMLElement;
    public canvasHolder: HTMLDivElement;
    public canvas: HTMLCanvasElement;
    public aspectRatio: number;
    public resizeHandle: HTMLDivElement;
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
    public constructor(container: HTMLElement, imageData: ImageData, imageName: string, nineSlice?: NinesliceData) {
        console.log(`Dimensions: ${imageData.width} ${imageData.height}`);

        let lastParent: HTMLElement | null = container;
        let i: number = 0;
        parent_loop: while (true) {
            if (!lastParent) break parent_loop;
            lastParent = lastParent.parentElement;
            i++;
        }

        this.imageData = imageData;
        this.nineSlice = nineSlice;
        this.container = container;

        // Holds the element in a div
        this.canvasHolder = document.createElement("div");
        this.canvasHolder.style.width = `${imageData.width}px`;
        this.canvasHolder.style.height = `${imageData.height}px`;
        this.canvasHolder.className = "draggable-canvas";
        this.canvasHolder.style.zIndex = String(i * 2);

        // Creates the canvas and puts it in the canvas holder
        this.canvas = document.createElement("canvas");

        const rect: DOMRect = container.getBoundingClientRect();

        this.aspectRatio = imageData.width / imageData.height;
        this.canvas.style.width = `${imageData.width}px`;
        this.canvas.style.height = `${imageData.height}px`;
        this.canvas.width = imageData.width;
        this.canvas.height = imageData.height;

        // Gives it a filename that can be read later while converting
        this.canvasHolder.dataset.imageName = imageName;

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

        // First element and therefore needs different positioning to center
        this.canvasHolder.style.left = `${rect.width / 2 - parseFloat(this.canvas.style.width) / 2}px`;
        this.canvasHolder.style.top = `${rect.height / 2 - parseFloat(this.canvas.style.height) / 2}px`;

        this.canvasHolder.style.position = "absolute";
        this.canvas.style.zIndex = String(2 * i);
        this.canvasHolder.appendChild(this.canvas);

        // Creates a resize handle and adds it to the canvas holder as a sibling to the canvas
        this.resizeHandle = document.createElement("div");
        this.resizeHandle.className = "resize-handle";
        this.resizeHandle.style.zIndex = String(2 * i + 1);
        this.resizeHandle.style.top = "-15px";
        this.canvasHolder.appendChild(this.resizeHandle);

        // Adds the canvas holder to the parent
        this.container.appendChild(this.canvasHolder);

        this.isDragging = false;
        this.isResizing = false;
        this.selected = false;
        this.offsetX = 0;
        this.offsetY = 0;

        this.initEvents();
    }

    public initEvents(): void {
        this.canvas.addEventListener("mousedown", (e) => this.startDrag(e));
        this.canvas.addEventListener("dblclick", (e) => this.select(e));
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
            if (selectedElement !== this.canvasHolder) {
                selectedElement.style.border = "2px solid black";
                this.selected = true;
                setSelectedElement(this.canvasHolder);
                this.canvasHolder.style.border = "2px solid blue";
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
    }

    public unSelect(_e?: MouseEvent): void {
        this.selected = false;
        setSelectedElement(undefined);
        this.canvasHolder.style.border = "2px solid black";
    }

    public startDrag(e: MouseEvent): void {
        if (e.target === this.resizeHandle) return;

        // Stop propagation for nested canvass
        if (this.container.classList.contains("draggable-canvas") || this.container.classList.contains("draggable-panel")) {
            e.stopPropagation();
        }

        this.isDragging = true;

        // Get position relative to parent container
        const canvasRect: DOMRect = this.canvasHolder.getBoundingClientRect();

        this.offsetX = e.clientX - canvasRect.left;
        this.offsetY = e.clientY - canvasRect.top;

        this.canvas.style.cursor = "grabbing";
    }

    public drag(e: MouseEvent): void {
        if (!this.isDragging || this.isResizing) return;
        const containerRect: DOMRect = this.container.getBoundingClientRect();

        if (config["boundary_constraints"]) {
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
    }

    public startResize(e: MouseEvent): void {
        e.stopPropagation(); // Prevent event from bubbling to parent
        this.isResizing = true;
        this.resizeStartWidth = parseFloat(this.canvas.style.width);
        this.resizeStartHeight = parseFloat(this.canvas.style.height);
        this.resizeStartX = e.clientX;
        this.resizeStartY = e.clientY;
        e.preventDefault();
    }

    public resize(e: MouseEvent): void {
        if (!this.isResizing) return;
        e.stopPropagation(); // Prevent event from bubbling to parent
        const containerRect: DOMRect = this.container.getBoundingClientRect();

        const widthChange: number = e.clientX - this.resizeStartX!;
        const heightChange: number = e.clientY - this.resizeStartY!;

        let newWidth: number;
        let newHeight: number;

        // If shift key is pressed, maintain aspect ratio,
        // only if the image is a 9-slice
        if (keyboardEvent?.shiftKey || !this.nineSlice) {
            newWidth = this.resizeStartWidth! + widthChange;
            newHeight = newWidth / this.aspectRatio;

            if (config["boundary_constraints"]) {
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
        } else {
            newWidth = this.resizeStartWidth! + widthChange;
            newHeight = this.resizeStartHeight! + heightChange;
        }

        this.drawImage(newWidth, newHeight);
    }

    public stopResize(): void {
        this.isResizing = false;
    }

    /**
     *
     * @param {number} width
     * @param {number} height
     */
    public drawImage(width: number, height: number): void {
        // Stops the canvas from being too small
        if (width <= 1) width = 1;
        if (height <= 1) height = 1;

        if (this.nineSlice) {
            const pixels: Uint8ClampedArray<ArrayBuffer> = Nineslice.ninesliceResize(
                this.nineSlice,
                this.imageData.data,
                Math.floor(width),
                Math.floor(height)
            );
            this.canvas.width = Math.floor(width);
            this.canvas.height = Math.floor(height);

            const newImageData: ImageData = new ImageData(pixels, Math.floor(width), Math.floor(height));

            // Draws the image
            const ctx: CanvasRenderingContext2D = this.canvas.getContext("2d")!;
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
    }
}