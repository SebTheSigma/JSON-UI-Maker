import { GLOBAL_ELEMENT_MAP, panelContainer} from "../index.js";
import { config } from "../CONFIG.js";
import { Nineslice } from "../nineslice.js";
import { keyboardEvent } from "../keyboard/eventListeners.js";
import { images, ImageDataState } from "../index.js";
import { DraggableCanvas } from "./canvas.js";
import { StringUtil } from "../util/stringUtil.js";
import { DraggableLabel } from "./label.js";
import { ElementSharedFuncs } from "./sharedElement.js";
import { GeneralUtil } from "../util/generalUtil.js";
import { ExplorerController } from "../ui/explorer/explorerController.js";

export interface ButtonOptions {
    collectionIndex?: string;
    hoverTexture?: string;
    defaultTexture?: string;
    pressedTexture?: string;
    displayTexture?: string;
    buttonText?: string;
    [key: string]: any;
}

export class DraggableButton {
    // Core data
    public imageDataDefault: ImageDataState;
    public imageDataHover: ImageDataState;
    public imageDataPressed: ImageDataState;

    // Display
    public displayCanvas?: DraggableCanvas;
    public displayTexture?: string;
    public displayText?: DraggableLabel;
    public aspectRatio: number;
    public centerCircle?: HTMLElement;

    // Core elements
    public container: HTMLElement;
    public outlineDiv: HTMLDivElement;
    public button: HTMLElement;
    public canvas: HTMLCanvasElement;
    public resizeHandle: HTMLDivElement;
    public gridElement: HTMLElement;

    // State flags
    public isDragging: boolean = false;
    public isResizing: boolean = false;
    public isHovering: boolean = false;
    public isPressing: boolean = false;
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
    public constructor(ID: string, container: HTMLElement, buttonOptions?: ButtonOptions) {
        const { defaultTexture, hoverTexture, pressedTexture, collectionIndex, displayTexture, buttonText } = buttonOptions ?? {};
        const i = GeneralUtil.getElementDepth(container, panelContainer);

        // Saves parameters
        (this as any)._constructorArgs = [ID, container, buttonOptions];

        const defaultTex = defaultTexture ?? hoverTexture ?? pressedTexture ?? "asset/placeholder.png";
        const hoverTex = hoverTexture ?? defaultTexture ?? pressedTexture ?? "asset/placeholder.png";
        const pressedTex = pressedTexture ?? hoverTexture ?? defaultTexture ?? "asset/placeholder.png";

        this.imageDataDefault = images.get(defaultTex)!;
        this.imageDataHover = images.get(hoverTex)!;
        this.imageDataPressed = images.get(pressedTex)!;
        this.displayTexture = displayTexture;

        this.aspectRatio = this.imageDataDefault.png?.width! / this.imageDataDefault.png?.height!;

        this.container = container;

        const rect: DOMRect = container.getBoundingClientRect();

        // Holds the element in a div
        this.button = document.createElement("div");
        this.button.className = "draggable-button";
        this.button.style.width = `${this.imageDataDefault.png?.width}px`;
        this.button.style.height = `${this.imageDataDefault.png?.height}px`;
        this.button.style.visibility = "visible";
        this.button.style.zIndex = String(i * 2);
        this.button.style.position = "absolute";
        this.button.style.outline = `${config.settings.element_outline.value}px solid black`;
        this.button.dataset.defaultImagePath = defaultTex;
        this.button.dataset.hoverImagePath = hoverTex;
        this.button.dataset.pressedImagePath = pressedTex;
        this.button.dataset.displayImagePath = displayTexture ?? "";
        this.button.dataset.id = ID;
        this.button.dataset.collectionIndex = collectionIndex ?? "0";

        // Creates the canvas and puts it in the canvas holder
        this.canvas = document.createElement("canvas");
        this.canvas.style.zIndex = String(2 * i);
        this.canvas.style.imageRendering = "pixelated";

        // Always fits the image into the parent container
        if (rect.width > rect.height) {
            const scaledHeight: number = rect.height * 0.8;
            this.drawImage(scaledHeight * this.aspectRatio, scaledHeight, this.imageDataDefault, true);
        } else if (rect.width <= rect.height) {
            const scaledWidth: number = rect.width * 0.8;
            this.drawImage(scaledWidth, scaledWidth / this.aspectRatio, this.imageDataDefault, true);
        }

        this.button.style.left = `${rect.width / 2 - parseFloat(this.canvas.style.width) / 2}px`;
        this.button.style.top = `${rect.height / 2 - parseFloat(this.canvas.style.height) / 2}px`;

        // Creates a resize handle and adds it to the canvas holder as a sibling to the canvas
        this.resizeHandle = document.createElement("div");
        this.resizeHandle.className = "resize-handle";
        this.resizeHandle.style.zIndex = String(2 * i + 1);
        this.resizeHandle.style.bottom = "-15px";

        this.outlineDiv = document.createElement("div");
        this.outlineDiv.className = "outline-div";
        this.outlineDiv.classList.add("body-attched");
        this.outlineDiv.style.outline = "3px dotted rgb(0, 0, 0)";
        this.outlineDiv.style.position = "absolute";
        this.outlineDiv.style.zIndex = "1000";

        this.gridElement = ElementSharedFuncs.generateGridElement();
        this.gridElement.style.top = `0px`;

        this.centerCircle = ElementSharedFuncs.generateCenterPoint();

        this.button.appendChild(this.canvas);
        this.button.appendChild(this.resizeHandle);
        this.button.appendChild(this.gridElement);
        this.button.appendChild(this.centerCircle);
        this.container.appendChild(this.button);
        document.body.appendChild(this.outlineDiv);

        this.initEvents();
        this.setDisplayText(buttonText ?? "Label");
        this.grid(false);

        if (this.displayTexture) this.setDisplayImage(this.displayTexture);

        ElementSharedFuncs.updateCenterCirclePosition(this);
        setTimeout(() => {
            ExplorerController.updateExplorer();
        }, 0);
    }

    public initEvents(): void {
        this.gridElement.addEventListener("mousedown", (e) => this.startDrag(e));
        this.gridElement.addEventListener("dblclick", (e) => this.select(e));
        document.addEventListener("mousemove", (e) => this.drag(e));
        document.addEventListener("mouseup", () => this.stopDrag());

        this.resizeHandle.addEventListener("mousedown", (e) => this.startResize(e));
        document.addEventListener("mousemove", (e) => this.outlineResize(e));
        document.addEventListener("mouseup", (e) => this.resize(e));
        document.addEventListener("mouseup", () => this.stopResize());

        this.button.addEventListener("mouseenter", this.startHover.bind(this));
        this.button.addEventListener("mouseleave", this.stopHover.bind(this));

        this.gridElement.addEventListener("mousedown", this.startPress.bind(this));
        this.gridElement.addEventListener("mouseup", this.stopPress.bind(this));
    }

    public select(e: MouseEvent): void {
        ElementSharedFuncs.select(e, this);
    }

    public unSelect(_e?: MouseEvent): void {
        ElementSharedFuncs.unSelect(this);
    }

    public startDrag(e: MouseEvent): void {
        if (e.target === this.resizeHandle) return;
        this.outlineDiv.style.display = "none";
        if (this.isResizing) this.stopResize();

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

        const rect = this.button.getBoundingClientRect();
        this.outlineDiv.style.top = `${rect.top + window.scrollY}px`;
        this.outlineDiv.style.left = `${rect.left + window.scrollX}px`;
        this.outlineDiv.style.display = "block";
    }

    public resize(e: MouseEvent): void {
        if (!this.isResizing) return;
        e.stopPropagation(); // Prevent event from bubbling to parent

        const outlineWidth = StringUtil.cssDimToNumber(this.outlineDiv.style.outlineWidth);
        const newWidth: number = (this.outlineDiv.style.width ? StringUtil.cssDimToNumber(this.outlineDiv.style.width) : 0) + outlineWidth;
        const newHeight: number = (this.outlineDiv.style.height ? StringUtil.cssDimToNumber(this.outlineDiv.style.height) : 0) + outlineWidth;

        this.drawImage(newWidth, newHeight, this.getCurrentlyRenderedState());
        ElementSharedFuncs.updateCenterCirclePosition(this);
    }

    public outlineResize(e: MouseEvent): void {
        if (!this.isResizing) return;
        e.stopPropagation(); // Prevent event from bubbling to parent
        const containerRect: DOMRect = this.container.getBoundingClientRect();

        const widthChange: number = e.clientX - this.resizeStartX!;
        const heightChange: number = e.clientY - this.resizeStartY!;

        let newWidth: number = this.resizeStartWidth! + widthChange;
        let newHeight: number = this.resizeStartHeight! + heightChange;
        const maxWidth: number = containerRect.width - parseFloat(this.button.style.left);
        const maxHeight: number = containerRect.height - parseFloat(this.button.style.top);

        // If shift key is pressed, maintain aspect ratio,
        // only if the image is a 9-slice
        const currentRenderState = this.getCurrentlyRenderedState() ?? this.imageDataDefault;

        if (!currentRenderState!.json) {
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

            if (!currentRenderState.json) {
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

    public stopResize(): void {
        this.outlineDiv.style.display = "none";
        ElementSharedFuncs.stopResize(this);
    }

    public startHover() {
        this.canvas.style.cursor = "pointer";
        this.isHovering = true;
        this.aspectRatio = this.imageDataHover.png?.width! / this.imageDataHover.png?.height!;

        this.drawImage(this.canvas.width, this.canvas.height, this.imageDataHover);
    }

    public stopHover() {
        this.canvas.style.cursor = "default";
        this.isHovering = false;
        this.aspectRatio = this.imageDataDefault.png?.width! / this.imageDataDefault.png?.height!;

        this.drawImage(this.canvas.width, this.canvas.height);
    }

    public startPress() {
        this.canvas.style.cursor = "grab";
        this.isPressing = true;
        this.aspectRatio = this.imageDataPressed.png?.width! / this.imageDataPressed.png?.height!;

        this.drawImage(this.canvas.width, this.canvas.height, this.imageDataPressed);
    }

    public stopPress() {
        this.isPressing = false;

        if (this.isHovering) {
            this.canvas.style.cursor = "pointer";
            this.aspectRatio = this.imageDataDefault.png?.width! / this.imageDataDefault.png?.height!;
        }
        else {
            this.canvas.style.cursor = "default";
            this.aspectRatio = this.imageDataHover.png?.width! / this.imageDataHover.png?.height!;
        }

        if (this.isHovering) this.drawImage(this.canvas.width, this.canvas.height, this.imageDataHover);
        else this.drawImage(this.canvas.width, this.canvas.height);
    }

    public getCurrentlyRenderedState() {
        if (this.isPressing) return this.imageDataPressed;
        else if (this.isHovering) return this.imageDataHover;
        else return this.imageDataDefault;
    }

    /**
     * Draws an image on the button canvas. If the image state is not specified, uses the default image state.
     * If _updateImage is true, scales the image to fill the button container while maintaining aspect ratio.
     *
     * @param {number} width - The width of the image to draw.
     * @param {number} height - The height of the image to draw.
     * @param {ImageDataState} [imageDataState=this.imageDataDefault] - The state of the image to draw.
     * @param {boolean} [_updateImage=false] - Whether to update the image to fill the button container, only needed if the image has changed.
     */
    public drawImage(width: number, height: number, imageDataState: ImageDataState = this.imageDataDefault, _updateImage: boolean = false): void {
        console.log("drawImage", width, height, imageDataState, _updateImage, Date.now());

        // Stops the canvas from being too small
        if (width <= 1) width = 1;
        if (height <= 1) height = 1;

        let floorWidth: number = Math.floor(width);
        let floorHeight: number = Math.floor(height);

        const ctx: CanvasRenderingContext2D = this.canvas.getContext("2d")!;

        if (imageDataState.json) {
            // --- Nine-slice resize ---
            const pixels: Uint8ClampedArray<ArrayBuffer> = Nineslice.ninesliceResize(imageDataState.json!, imageDataState.png?.data!, floorWidth, floorHeight);

            this.canvas.width = floorWidth;
            this.canvas.height = floorHeight;

            const newImageData: ImageData = new ImageData(pixels, floorWidth, floorHeight);
            ctx.putImageData(newImageData, 0, 0);
        } else {
            // Desired max bounding box
            const maxWidth = floorWidth;
            const maxHeight = floorHeight;

            // Original image size
            const imgW = imageDataState.png!.width;
            const imgH = imageDataState.png!.height;

            // Compute scale factor so image fits inside box
            const scale = Math.min(maxWidth / imgW, maxHeight / imgH);

            // New scaled dimensions
            floorWidth = Math.floor(imgW * scale);
            floorHeight = Math.floor(imgH * scale);

            // Resize canvas to match scaled size
            this.canvas.width = maxWidth;
            this.canvas.height = maxHeight;

            // Draw image scaled into canvas
            const offscreen = document.createElement("canvas");
            offscreen.width = imgW;
            offscreen.height = imgH;
            offscreen.getContext("2d")!.putImageData(imageDataState.png!, 0, 0);

            // Compute centering offsets
            const dx = (maxWidth - floorWidth) / 2;
            const dy = (maxHeight - floorHeight) / 2;

            // Draw image scaled into canvas, centered
            ctx.drawImage(
                offscreen,
                0, 0, imgW, imgH,        // source rect
                dx, dy, floorWidth, floorHeight // destination rect
            );

        }

        // **Scale the display size (but keep internal resolution high)**
        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;

        // Optional: Center the canvas if needed
        this.canvas.style.display = "block";
        this.canvas.style.margin = "0 auto";

        this.button.style.width = `${width}px`;
        this.button.style.height = `${height}px`;

        if (_updateImage) {
            this.canvas.width = imageDataState.png?.width!;
            this.canvas.height = imageDataState.png?.height!;

            const rect: DOMRect = this.container.getBoundingClientRect();

            // Reset full-res image
            const offscreen = document.createElement("canvas");
            offscreen.width = imageDataState.png!.width;
            offscreen.height = imageDataState.png!.height;
            offscreen.getContext("2d")!.putImageData(imageDataState.png!, 0, 0);
            ctx.drawImage(offscreen, 0, 0);

            // Recalculate scaling based on container size
            if (rect.width > rect.height) {
                const scaledHeight: number = rect.height * 0.8;
                this.drawImage(scaledHeight * this.aspectRatio, scaledHeight, imageDataState, false);
            } else {
                const scaledWidth: number = rect.width * 0.8;
                this.drawImage(scaledWidth, scaledWidth / this.aspectRatio, imageDataState, false);
            }
        }
    }

    public setDefaultImage(imagePath: string): void {
        const data = images.get(imagePath);

        // Checks if the image is there
        if (!data || !data.png) return;

        // Sets pixel data
        this.imageDataDefault = data;

        this.button.dataset.defaultImagePath = imagePath;
        this.drawImage(this.canvas.width, this.canvas.height, data);

        ElementSharedFuncs.updateCenterCirclePosition(this);
    }

    public setHoverImage(imagePath: string): void {
        const data = images.get(imagePath);

        // Checks if the image is there
        if (!data || !data.png) return;

        // Sets pixel data
        this.imageDataHover = data;

        this.button.dataset.hoverImagePath = imagePath;
        this.drawImage(this.canvas.width, this.canvas.height, data);

                ElementSharedFuncs.updateCenterCirclePosition(this);
    }

    public setPressedImage(imagePath: string): void {
        const data = images.get(imagePath);

        // Checks if the image is there
        if (!data || !data.png) return;

        // Sets pixel data
        this.imageDataPressed = data;

        this.button.dataset.pressedImagePath = imagePath;
        this.drawImage(this.canvas.width, this.canvas.height, data);

                ElementSharedFuncs.updateCenterCirclePosition(this);
    }

    public setDisplayImage(imagePath: string): void {
        // Removes the canvas
        if (this.displayCanvas) this.displayCanvas.changeImage(imagePath);
        else {
            const data = images.get(imagePath);
            if (!data || !data.png) return;

            const id = StringUtil.generateRandomString(15);
            this.displayCanvas = new DraggableCanvas(id, this.button, data.png, imagePath, data.json);
            this.displayCanvas.deleteable = false;
            GLOBAL_ELEMENT_MAP.set(id, this.displayCanvas);
        }

        this.displayCanvas.setParse(false);
        this.button.dataset.displayImagePath = imagePath;
    }

    public setDisplayText(text: string): void {
        const id = StringUtil.generateRandomString(15);

        this.displayText = new DraggableLabel(id, this.button, { text: text, includeTextPrompt: false });
        this.displayText.deleteable = false;

        this.displayText.setParse(false);
        this.button.dataset.displayText = text;
        GLOBAL_ELEMENT_MAP.set(id, this.displayText);
    }

    public getMainHTMLElement(): HTMLElement {
        return this.button;
    }

    public delete(): void {
        if (!this.deleteable) return;
        if (this.selected) this.unSelect();

        if (this.displayCanvas) {
            this.displayCanvas.deleteable = true;
            this.displayCanvas.delete();
        }

        if (this.displayText) {
            this.displayText.deleteable = true;
            this.displayText.delete();
        }

        this.container.removeChild(this.getMainHTMLElement());
        document.body.removeChild(this.outlineDiv);

        this.detach();
    }

    public detach(): void {
        document.removeEventListener("mousemove", (e) => this.drag(e));
        document.removeEventListener("mouseup", () => this.stopDrag());
        document.removeEventListener("mousemove", (e) => this.outlineResize(e));
        document.removeEventListener("mouseup", (e) => this.resize(e));
        document.removeEventListener("mouseup", () => this.stopResize());
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
