import { selectedElement, setSelectedElement } from "../index.js";
import { config } from "../CONFIG.js";
import { Nineslice } from "../nineslice.js";
import { keyboardEvent } from "../keyboard/eventListeners.js";
import { images } from "../index.js";
export class DraggableButton {
    imageDataDefault;
    imageDataHover;
    imageDataPressed;
    nineSlice;
    container;
    button;
    canvas;
    aspectRatio;
    resizeHandle;
    isDragging;
    isResizing;
    selected;
    offsetX;
    offsetY;
    resizeStartWidth;
    resizeStartHeight;
    resizeStartX;
    resizeStartY;
    isHovering = false;
    isPressing = false;
    /**
     * @param {HTMLElement} container
     */
    constructor(container, buttonOptions) {
        const { defaultTexture, hoverTexture, pressedTexture } = buttonOptions ?? {};
        const defaultTex = defaultTexture ?? hoverTexture ?? pressedTexture ?? "";
        const hoverTex = hoverTexture ?? defaultTexture ?? pressedTexture ?? "";
        const pressedTex = pressedTexture ?? hoverTexture ?? defaultTexture ?? "";
        this.imageDataDefault = images.get(defaultTex);
        this.imageDataHover = images.get(hoverTex);
        this.imageDataPressed = images.get(pressedTex);
        let lastParent = container;
        let i = 0;
        parent_loop: while (true) {
            if (!lastParent)
                break parent_loop;
            lastParent = lastParent.parentElement;
            i++;
        }
        this.container = container;
        // Holds the element in a div
        this.button = document.createElement("div");
        this.button.style.width = `${this.imageDataDefault.png?.width}px`;
        this.button.style.height = `${this.imageDataDefault.png?.height}px`;
        this.button.className = "draggable-button";
        this.button.style.zIndex = String(i * 2);
        //------ CUSTOM DATA ------
        // Gives it a filename that can be read later while converting
        this.button.dataset.defaultImageName = defaultTex;
        this.button.dataset.hoverImageName = hoverTex;
        this.button.dataset.pressedImageName = pressedTex;
        this.button.dataset.collectionIndex = buttonOptions?.collectionIndex?.toFixed() ?? '0';
        //-------------------------
        // Creates the canvas and puts it in the canvas holder
        this.canvas = document.createElement("canvas");
        const rect = container.getBoundingClientRect();
        this.aspectRatio = this.imageDataDefault.png?.width / this.imageDataDefault.png?.height;
        this.canvas.style.width = `${this.imageDataDefault.png?.width}px`;
        this.canvas.style.height = `${this.imageDataDefault.png?.height}px`;
        this.canvas.width = rect.width * 0.8;
        this.canvas.height = rect.height * 0.8;
        // Always fits the image into the parent container
        if (rect.width > rect.height) {
            console.log(10000);
            const scaledHeight = rect.height * 0.8;
            this.drawImage(scaledHeight * this.aspectRatio, scaledHeight);
        }
        else if (rect.width <= rect.height) {
            console.log(20000);
            const scaledWidth = rect.width * 0.8;
            this.drawImage(scaledWidth, scaledWidth / this.aspectRatio);
        }
        // First element and therefore needs different positioning to center
        this.button.style.left = `${rect.width / 2 - parseFloat(this.canvas.style.width) / 2}px`;
        this.button.style.top = `${rect.height / 2 - parseFloat(this.canvas.style.height) / 2}px`;
        this.button.style.position = "absolute";
        this.canvas.style.zIndex = String(2 * i);
        this.button.appendChild(this.canvas);
        // Creates a resize handle and adds it to the canvas holder as a sibling to the canvas
        this.resizeHandle = document.createElement("div");
        this.resizeHandle.className = "resize-handle";
        this.resizeHandle.style.zIndex = String(2 * i + 1);
        this.resizeHandle.style.top = "-15px";
        this.button.appendChild(this.resizeHandle);
        // Adds the canvas holder to the parent
        this.container.appendChild(this.button);
        this.isDragging = false;
        this.isResizing = false;
        this.selected = false;
        this.offsetX = 0;
        this.offsetY = 0;
        this.initEvents();
        this.button.addEventListener('mouseenter', this.startHover.bind(this));
        this.button.addEventListener('mouseleave', this.stopHover.bind(this));
        this.button.addEventListener('mousedown', this.startPress.bind(this));
        this.button.addEventListener('mouseup', this.stopPress.bind(this));
    }
    initEvents() {
        this.canvas.addEventListener("mousedown", (e) => this.startDrag(e));
        this.canvas.addEventListener("dblclick", (e) => this.select(e));
        document.addEventListener("mousemove", (e) => this.drag(e));
        document.addEventListener("mouseup", () => this.stopDrag());
        this.resizeHandle.addEventListener("mousedown", (e) => this.startResize(e));
        document.addEventListener("mousemove", (e) => this.resize(e));
        document.addEventListener("mouseup", () => this.stopResize());
    }
    select(e) {
        e.stopPropagation(); // Prevent the event from bubbling up to the parent
        console.log(this.selected);
        if (selectedElement) {
            if (selectedElement !== this.button) {
                selectedElement.style.border = "2px solid black";
                this.selected = true;
                setSelectedElement(this.button);
                this.button.style.border = "2px solid blue";
                return;
            }
        }
        if (this.selected) {
            this.unSelect(e);
            return;
        }
        this.selected = true;
        setSelectedElement(this.button);
        this.button.style.border = "2px solid blue";
    }
    unSelect(_e) {
        this.selected = false;
        setSelectedElement(undefined);
        this.button.style.border = "2px solid black";
    }
    startDrag(e) {
        if (e.target === this.resizeHandle)
            return;
        // Stop propagation for nested canvass
        if (this.container.classList.contains("draggable-canvas") || this.container.classList.contains("draggable-panel")) {
            e.stopPropagation();
        }
        this.isDragging = true;
        // Get position relative to parent container
        const canvasRect = this.button.getBoundingClientRect();
        this.offsetX = e.clientX - canvasRect.left;
        this.offsetY = e.clientY - canvasRect.top;
        this.canvas.style.cursor = "grabbing";
    }
    drag(e) {
        if (!this.isDragging || this.isResizing)
            return;
        const containerRect = this.container.getBoundingClientRect();
        if (config.settings.boundary_constraints.value) {
            let newLeft = e.clientX - containerRect.left - this.offsetX;
            let newTop = e.clientY - containerRect.top - this.offsetY;
            // Constrain to container bounds
            newLeft = Math.max(0, Math.min(newLeft, containerRect.width - Number(this.button.style.width.replace("px", ""))));
            newTop = Math.max(0, Math.min(newTop, containerRect.height - Number(this.button.style.height.replace("px", ""))));
            this.button.style.left = `${newLeft}px`;
            this.button.style.top = `${newTop}px`;
        }
        else {
            // Calculate position relative to parent container
            const newLeft = e.clientX - containerRect.left - this.offsetX;
            const newTop = e.clientY - containerRect.top - this.offsetY;
            this.button.style.left = `${newLeft}px`;
            this.button.style.top = `${newTop}px`;
        }
    }
    stopDrag() {
        this.isDragging = false;
        this.canvas.style.cursor = "grab";
    }
    startResize(e) {
        e.stopPropagation(); // Prevent event from bubbling to parent
        this.isResizing = true;
        this.resizeStartWidth = parseFloat(this.canvas.style.width);
        this.resizeStartHeight = parseFloat(this.canvas.style.height);
        this.resizeStartX = e.clientX;
        this.resizeStartY = e.clientY;
        e.preventDefault();
    }
    resize(e) {
        if (!this.isResizing)
            return;
        e.stopPropagation(); // Prevent event from bubbling to parent
        const containerRect = this.container.getBoundingClientRect();
        const widthChange = e.clientX - this.resizeStartX;
        const heightChange = e.clientY - this.resizeStartY;
        let newWidth;
        let newHeight;
        // If shift key is pressed, maintain aspect ratio,
        // only if the image is a 9-slice
        if (keyboardEvent?.shiftKey || !this.getCurrentlyRenderedState().json) {
            newWidth = this.resizeStartWidth + widthChange;
            newHeight = newWidth / this.aspectRatio;
            if (config.settings.boundary_constraints.value) {
                // Determine the maximum possible width while maintaining aspect ratio
                const maxWidth = containerRect.width - parseFloat(this.button.style.left);
                const maxHeight = containerRect.height - parseFloat(this.button.style.top);
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
        }
        else {
            newWidth = this.resizeStartWidth + widthChange;
            newHeight = this.resizeStartHeight + heightChange;
        }
        this.drawImage(newWidth, newHeight);
    }
    stopResize() {
        this.isResizing = false;
    }
    startHover() {
        this.canvas.style.cursor = "pointer";
        this.isHovering = true;
        console.log(`Start-Hover: hover-${this.isHovering}, press-${this.isPressing}`);
        this.drawImage(this.canvas.width, this.canvas.height, this.imageDataHover);
    }
    stopHover() {
        this.canvas.style.cursor = "default";
        this.isHovering = false;
        this.drawImage(this.canvas.width, this.canvas.height);
    }
    startPress() {
        this.canvas.style.cursor = "grab";
        this.isPressing = true;
        this.drawImage(this.canvas.width, this.canvas.height, this.imageDataPressed);
    }
    stopPress() {
        this.isPressing = false;
        if (this.isHovering)
            this.canvas.style.cursor = "pointer";
        else
            this.canvas.style.cursor = "default";
        if (!this.isHovering)
            this.drawImage(this.canvas.width, this.canvas.height);
        else
            this.drawImage(this.canvas.width, this.canvas.height, this.imageDataHover);
    }
    getCurrentlyRenderedState() {
        if (this.isPressing)
            return this.imageDataHover;
        else if (this.isHovering)
            return this.imageDataPressed;
        else
            return this.imageDataDefault;
    }
    /**
     *
     * @param {number} width
     * @param {number} height
     */
    drawImage(width, height, imageDataState = this.imageDataDefault) {
        // Stops the canvas from being too small
        if (width <= 1)
            width = 1;
        if (height <= 1)
            height = 1;
        if (imageDataState.json) {
            const pixels = Nineslice.ninesliceResize(imageDataState.json, imageDataState.png?.data, Math.floor(width), Math.floor(height));
            this.canvas.width = Math.floor(width);
            this.canvas.height = Math.floor(height);
            const newImageData = new ImageData(pixels, Math.floor(width), Math.floor(height));
            // Draws the image
            const ctx = this.canvas.getContext("2d");
            ctx.putImageData(newImageData, 0, 0);
        }
        // **Scale the display size (but keep internal resolution high)**
        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;
        // Optional: Center the canvas if needed
        this.canvas.style.display = "block";
        this.canvas.style.margin = "0 auto";
        this.button.style.width = `${width}px`;
        this.button.style.height = `${height}px`;
    }
}
//# sourceMappingURL=button.js.map