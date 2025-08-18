import { GLOBAL_ELEMENT_MAP, isInMainWindow, panelContainer } from "../index.js";
import { config } from "../CONFIG.js";
import { Nineslice } from "../nineslice.js";
import { keyboardEvent } from "../keyboard/eventListeners.js";
import { images } from "../index.js";
import { updatePropertiesArea } from "../ui/propertiesArea.js";
import { AllJsonUIElements } from "./elements.js";
import { DraggableCanvas } from "./canvas.js";
import { StringUtil } from "../util/stringUtil.js";
import { DraggableLabel } from "./label.js";
import { ElementSharedFuncs } from "./sharedElement.js";
import { GeneralUtil } from "../util/generalUtil.js";
export class DraggableButton {
    // Core data
    imageDataDefault;
    imageDataHover;
    imageDataPressed;
    // Display
    displayCanvas;
    displayTexture;
    displayText;
    aspectRatio;
    // Core elements
    container;
    outlineDiv;
    button;
    canvas;
    resizeHandle;
    // State flags
    isDragging = false;
    isResizing = false;
    isHovering = false;
    isPressing = false;
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
    constructor(ID, container, buttonOptions) {
        const { defaultTexture, hoverTexture, pressedTexture, collectionIndex, displayTexture, buttonText } = buttonOptions ?? {};
        const i = GeneralUtil.getElementDepth(container, panelContainer);
        // Saves parameters
        this._constructorArgs = [ID, container, buttonOptions];
        const defaultTex = defaultTexture ?? hoverTexture ?? pressedTexture ?? "";
        const hoverTex = hoverTexture ?? defaultTexture ?? pressedTexture ?? "";
        const pressedTex = pressedTexture ?? hoverTexture ?? defaultTexture ?? "";
        this.imageDataDefault = images.get(defaultTex);
        this.imageDataHover = images.get(hoverTex);
        this.imageDataPressed = images.get(pressedTex);
        this.displayTexture = displayTexture;
        this.aspectRatio = this.imageDataDefault.png?.width / this.imageDataDefault.png?.height;
        this.container = container;
        const rect = container.getBoundingClientRect();
        // Holds the element in a div
        this.button = document.createElement("div");
        this.button.style.width = `${this.imageDataDefault.png?.width}px`;
        this.button.style.height = `${this.imageDataDefault.png?.height}px`;
        this.button.className = "draggable-button";
        this.button.style.visibility = "visible";
        this.button.style.zIndex = String(i * 2);
        this.button.style.position = "absolute";
        this.button.dataset.defaultImageName = defaultTex;
        this.button.dataset.hoverImageName = hoverTex;
        this.button.dataset.pressedImageName = pressedTex;
        this.button.dataset.displayImageName = displayTexture ?? "";
        this.button.dataset.id = ID;
        this.button.dataset.collectionIndex = collectionIndex ?? "0";
        // Creates the canvas and puts it in the canvas holder
        this.canvas = document.createElement("canvas");
        this.canvas.style.zIndex = String(2 * i);
        // Always fits the image into the parent container
        if (rect.width > rect.height) {
            const scaledHeight = rect.height * 0.8;
            this.drawImage(scaledHeight * this.aspectRatio, scaledHeight, this.imageDataDefault, true);
        }
        else if (rect.width <= rect.height) {
            const scaledWidth = rect.width * 0.8;
            this.drawImage(scaledWidth, scaledWidth / this.aspectRatio, this.imageDataDefault, true);
        }
        // First element and therefore needs different positioning to center
        this.button.style.left = `${rect.width / 2 - parseFloat(this.canvas.style.width) / 2}px`;
        this.button.style.top = `${rect.height / 2 - parseFloat(this.canvas.style.height) / 2}px`;
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
        this.button.appendChild(this.canvas);
        this.button.appendChild(this.resizeHandle);
        this.container.appendChild(this.button);
        document.body.appendChild(this.outlineDiv);
        this.initEvents();
        this.setDisplayText(buttonText ?? "Label");
        this.grid(config.settings.show_grid.value);
    }
    initEvents() {
        this.canvas.addEventListener("mousedown", (e) => this.startDrag(e));
        this.canvas.addEventListener("dblclick", (e) => this.select(e));
        document.addEventListener("mousemove", (e) => this.drag(e));
        document.addEventListener("mouseup", () => this.stopDrag());
        this.resizeHandle.addEventListener("mousedown", (e) => this.startResize(e));
        document.addEventListener("mousemove", (e) => this.outlineResize(e));
        document.addEventListener("mouseup", (e) => this.resize(e));
        document.addEventListener("mouseup", () => this.stopResize());
        this.button.addEventListener("mouseenter", this.startHover.bind(this));
        this.button.addEventListener("mouseleave", this.stopHover.bind(this));
        this.canvas.addEventListener("mousedown", this.startPress.bind(this));
        this.canvas.addEventListener("mouseup", this.stopPress.bind(this));
    }
    select(e) {
        ElementSharedFuncs.select(e, this);
        this.grid(config.settings.show_grid.value);
    }
    unSelect(_e) {
        ElementSharedFuncs.unSelect(this);
        this.grid(false);
    }
    startDrag(e) {
        if (e.target === this.resizeHandle)
            return;
        this.outlineDiv.style.display = "none";
        if (this.isResizing)
            this.stopResize();
        // Stop propagation for nested elements
        for (let elementName of AllJsonUIElements) {
            if (this.container.classList.contains(elementName)) {
                e.stopPropagation();
            }
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
        if (isInMainWindow)
            updatePropertiesArea();
    }
    startResize(e) {
        ElementSharedFuncs.startResize(e, this);
        const rect = this.button.getBoundingClientRect();
        this.outlineDiv.style.top = `${rect.top + window.scrollY}px`;
        this.outlineDiv.style.left = `${rect.left + window.scrollX}px`;
        this.outlineDiv.style.display = "block";
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
    outlineResize(e) {
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
        this.outlineDiv.style.width = `${newWidth - StringUtil.cssDimToNumber(this.outlineDiv.style.borderWidth)}px`;
        this.outlineDiv.style.height = `${newHeight - StringUtil.cssDimToNumber(this.outlineDiv.style.borderWidth)}px`;
    }
    stopResize() {
        this.outlineDiv.style.display = "none";
        ElementSharedFuncs.stopResize(this);
    }
    startHover() {
        this.canvas.style.cursor = "pointer";
        this.isHovering = true;
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
        if (this.isHovering)
            this.drawImage(this.canvas.width, this.canvas.height, this.imageDataHover);
        else
            this.drawImage(this.canvas.width, this.canvas.height);
    }
    getCurrentlyRenderedState() {
        if (this.isPressing)
            return this.imageDataPressed;
        else if (this.isHovering)
            return this.imageDataHover;
        else
            return this.imageDataDefault;
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
    drawImage(width, height, imageDataState = this.imageDataDefault, _updateImage = false) {
        console.log("drawImage", width, height, imageDataState, _updateImage, Date.now());
        // Stops the canvas from being too small
        if (width <= 1)
            width = 1;
        if (height <= 1)
            height = 1;
        const floorWidth = Math.floor(width);
        const floorHeight = Math.floor(height);
        const ctx = this.canvas.getContext("2d");
        if (imageDataState.json) {
            // --- Nine-slice resize ---
            const pixels = Nineslice.ninesliceResize(imageDataState.json, imageDataState.png?.data, floorWidth, floorHeight);
            this.canvas.width = floorWidth;
            this.canvas.height = floorHeight;
            const newImageData = new ImageData(pixels, floorWidth, floorHeight);
            ctx.putImageData(newImageData, 0, 0);
        }
        else {
            // --- Standard scaling path ---
            this.canvas.width = floorWidth;
            this.canvas.height = floorHeight;
            // Convert ImageData into a temporary canvas
            const offscreen = document.createElement("canvas");
            offscreen.width = imageDataState.png.width;
            offscreen.height = imageDataState.png.height;
            offscreen.getContext("2d").putImageData(imageDataState.png, 0, 0);
            // Scale it into our target canvas
            ctx.drawImage(offscreen, 0, 0, offscreen.width, offscreen.height, 0, 0, floorWidth, floorHeight);
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
            this.canvas.width = imageDataState.png?.width;
            this.canvas.height = imageDataState.png?.height;
            const rect = this.container.getBoundingClientRect();
            // Reset full-res image
            const offscreen = document.createElement("canvas");
            offscreen.width = imageDataState.png.width;
            offscreen.height = imageDataState.png.height;
            offscreen.getContext("2d").putImageData(imageDataState.png, 0, 0);
            ctx.drawImage(offscreen, 0, 0);
            // Recalculate scaling based on container size
            if (rect.width > rect.height) {
                const scaledHeight = rect.height * 0.8;
                this.drawImage(scaledHeight * this.aspectRatio, scaledHeight, imageDataState, false);
            }
            else {
                const scaledWidth = rect.width * 0.8;
                this.drawImage(scaledWidth, scaledWidth / this.aspectRatio, imageDataState, false);
            }
        }
    }
    setDefaultImage(imageName) {
        const data = images.get(imageName);
        // Checks if the image is there
        if (!data || !data.png)
            return;
        // Sets pixel data
        this.imageDataDefault = data;
        this.button.dataset.defaultImageName = imageName;
        this.drawImage(this.canvas.width, this.canvas.height, data);
    }
    setHoverImage(imageName) {
        const data = images.get(imageName);
        // Checks if the image is there
        if (!data || !data.png)
            return;
        // Sets pixel data
        this.imageDataHover = data;
        this.button.dataset.hoverImageName = imageName;
        this.drawImage(this.canvas.width, this.canvas.height, data);
    }
    setPressedImage(imageName) {
        const data = images.get(imageName);
        // Checks if the image is there
        if (!data || !data.png)
            return;
        // Sets pixel data
        this.imageDataPressed = data;
        this.button.dataset.pressedImageName = imageName;
        this.drawImage(this.canvas.width, this.canvas.height, data);
    }
    setDisplayImage(imageName) {
        // Removes the canvas
        if (this.displayCanvas)
            this.displayCanvas.changeImage(imageName);
        else {
            const data = images.get(imageName);
            if (!data || !data.png)
                return;
            const id = StringUtil.generateRandomString(15);
            this.displayCanvas = new DraggableCanvas(id, this.button, data.png, imageName, data.json);
            this.displayCanvas.deleteable = false;
            GLOBAL_ELEMENT_MAP.set(id, this.displayCanvas);
        }
        this.displayCanvas.setParse(false);
        this.button.dataset.displayImageName = imageName;
    }
    setDisplayText(text) {
        const id = StringUtil.generateRandomString(15);
        this.displayText = new DraggableLabel(id, this.button, { text: text, includeTextPrompt: false });
        this.displayText.deleteable = false;
        this.displayText.setParse(false);
        this.button.dataset.displayText = text;
        GLOBAL_ELEMENT_MAP.set(id, this.displayText);
    }
    getMainHTMLElement() {
        return this.button;
    }
    delete() {
        if (!this.deleteable)
            return;
        if (this.selected)
            this.unSelect();
        if (this.displayCanvas) {
            this.displayCanvas.deleteable = true;
            this.displayCanvas.delete();
        }
        if (this.displayText) {
            this.displayText.deleteable = true;
            this.displayText.delete();
        }
        this.container.removeChild(this.getMainHTMLElement());
        document.removeEventListener("mousemove", (e) => this.drag(e));
        document.removeEventListener("mouseup", () => this.stopDrag());
        document.removeEventListener("mousemove", (e) => this.outlineResize(e));
        document.removeEventListener("mouseup", (e) => this.resize(e));
        document.removeEventListener("mouseup", () => this.stopResize());
    }
    grid(showGrid) {
        const element = this.getMainHTMLElement();
        if (!showGrid) {
            element.style.removeProperty("--grid-cols");
            element.style.removeProperty("--grid-rows");
        }
        else {
            element.style.setProperty("--grid-cols", String(config.settings.grid_lock_columns.value));
            element.style.setProperty("--grid-rows", String(config.settings.grid_lock_rows.value));
        }
    }
}
//# sourceMappingURL=button.js.map