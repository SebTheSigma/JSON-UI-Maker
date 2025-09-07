import { images, panelContainer } from "../index.js";
import { Nineslice } from "../nineslice.js";
import { config } from "../CONFIG.js";
import { keyboardEvent } from "../keyboard/eventListeners.js";
import { StringUtil } from "../util/stringUtil.js";
import { ElementSharedFuncs } from "./sharedElement.js";
import { GeneralUtil } from "../util/generalUtil.js";
export class DraggableCanvas {
    // Core data
    imageData;
    nineSlice;
    // Core elements
    container;
    outlineDiv;
    canvasHolder;
    canvas;
    resizeHandle;
    gridElement;
    centerCircle;
    // Display
    aspectRatio;
    // State flags
    isDragging = false;
    isResizing = false;
    selected = false;
    deleteable = true;
    isEditable = true;
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
    constructor(ID, container, imageData, imageName, nineSlice) {
        const i = GeneralUtil.getElementDepth(container, panelContainer);
        // Saves parameters
        this._constructorArgs = [ID, container, imageData, imageName, nineSlice];
        this.imageData = imageData;
        this.aspectRatio = imageData.width / imageData.height;
        this.nineSlice = nineSlice;
        this.container = container;
        const rect = container.getBoundingClientRect();
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
        this.canvas.style.zIndex = String(i * 2);
        // Draws the image
        const ctx = this.canvas.getContext("2d");
        ctx.putImageData(this.imageData, 0, 0);
        // Always fits the image into the parent container
        if (rect.width > rect.height) {
            const scaledHeight = rect.height * 0.8;
            this.drawImage(scaledHeight * this.aspectRatio, scaledHeight, true);
        }
        else if (rect.width <= rect.height) {
            const scaledWidth = rect.width * 0.8;
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
        this.outlineDiv.style.border = "3px dotted rgb(0, 0, 0)";
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
    }
    initEvents() {
        // Using the grid element as a drag target, i cant seem
        // to get the canvas to accept input through the grid so this is a workaround
        this.gridElement.addEventListener("mousedown", (e) => this.startDrag(e));
        this.gridElement.addEventListener("dblclick", (e) => this.select(e));
        document.addEventListener("mousemove", (e) => this.drag(e));
        document.addEventListener("mouseup", () => this.stopDrag());
        this.resizeHandle.addEventListener("mousedown", (e) => this.startResize(e));
        document.addEventListener("mousemove", (e) => this.outlineResize(e));
        document.addEventListener("mouseup", (e) => this.resize(e));
        document.addEventListener("mouseup", () => this.stopResize());
    }
    select(e) {
        if (!this.isEditable)
            return;
        ElementSharedFuncs.select(e, this);
    }
    unSelect(_e) {
        if (!this.isEditable)
            return;
        ElementSharedFuncs.unSelect(this);
    }
    startDrag(e) {
        if (e.target === this.resizeHandle || !this.isEditable)
            return;
        this.outlineDiv.style.display = "none";
        if (this.isResizing)
            this.stopResize();
        ElementSharedFuncs.startDrag(e, this);
        this.centerCircle.style.display = "block";
    }
    drag(e) {
        ElementSharedFuncs.drag(e, this);
    }
    stopDrag() {
        ElementSharedFuncs.stopDrag(this);
        this.centerCircle.style.display = "none";
    }
    startResize(e) {
        e.stopPropagation(); // Prevent event from bubbling to parent
        if (!this.isEditable)
            return;
        ElementSharedFuncs.startResize(e, this, false); // False because propagation is already called
        const rect = this.canvasHolder.getBoundingClientRect();
        this.outlineDiv.style.top = `${rect.top + window.scrollY}px`;
        this.outlineDiv.style.left = `${rect.left + window.scrollX}px`;
        this.outlineDiv.style.display = "block";
    }
    resize(e) {
        if (!this.isResizing || !this.isEditable)
            return;
        e.stopPropagation(); // Prevent event from bubbling to parent
        const newWidth = this.outlineDiv.style.width ? StringUtil.cssDimToNumber(this.outlineDiv.style.width) : 0;
        const newHeight = this.outlineDiv.style.height ? StringUtil.cssDimToNumber(this.outlineDiv.style.height) : 0;
        this.drawImage(newWidth, newHeight);
        ElementSharedFuncs.updateCenterCirclePosition(this);
    }
    outlineResize(e) {
        if (!this.isResizing || !this.isEditable)
            return;
        e.stopPropagation(); // Prevent event from bubbling to parent
        const containerRect = this.container.getBoundingClientRect();
        const widthChange = e.clientX - this.resizeStartX;
        const heightChange = e.clientY - this.resizeStartY;
        let newWidth = this.resizeStartWidth + widthChange;
        let newHeight = this.resizeStartHeight + heightChange;
        const maxWidth = containerRect.width - parseFloat(this.canvasHolder.style.left);
        const maxHeight = containerRect.height - parseFloat(this.canvasHolder.style.top);
        // If shift key is pressed, maintain aspect ratio,
        // only if the image is a 9-slice
        if (!this.nineSlice) {
            newHeight = newWidth / this.aspectRatio;
        }
        else if (keyboardEvent?.shiftKey) {
            if (newHeight > newWidth) {
                newWidth = newHeight;
            }
            else {
                newHeight = newWidth;
            }
        }
        const borderWidth = StringUtil.cssDimToNumber(this.outlineDiv.style.borderWidth);
        if (config.settings.boundary_constraints.value) {
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
            this.outlineDiv.style.width = `${Math.max(0, Math.min(newWidth, maxWidth)) - borderWidth}px`;
            this.outlineDiv.style.height = `${Math.max(0, Math.min(newHeight, maxHeight)) - borderWidth}px`;
        }
        else {
            this.outlineDiv.style.width = `${newWidth - borderWidth}px`;
            this.outlineDiv.style.height = `${newHeight - borderWidth}px`;
        }
    }
    stopResize() {
        this.outlineDiv.style.display = "none";
        ElementSharedFuncs.stopResize(this);
    }
    /**
     *
     * @param {number} width
     * @param {number} height
     */
    drawImage(width, height, _updateImage = false) {
        width = Math.floor(width);
        height = Math.floor(height);
        // Stops the canvas from being too small
        if (width <= 1)
            width = 1;
        if (height <= 1)
            height = 1;
        const ctx = this.canvas.getContext("2d");
        if (this.nineSlice) {
            const pixels = Nineslice.ninesliceResize(this.nineSlice, this.imageData.data, width, height);
            this.canvas.width = width;
            this.canvas.height = height;
            const newImageData = new ImageData(pixels, width, height, { colorSpace: this.imageData.colorSpace });
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
            const rect = this.container.getBoundingClientRect();
            ctx.putImageData(this.imageData, 0, 0);
            if (rect.width > rect.height) {
                const scaledHeight = rect.height * 0.8;
                this.drawImage(scaledHeight * this.aspectRatio, scaledHeight, false);
            }
            else if (rect.width <= rect.height) {
                const scaledWidth = rect.width * 0.8;
                this.drawImage(scaledWidth, scaledWidth / this.aspectRatio, false);
            }
        }
    }
    changeImage(imageName) {
        const data = images.get(imageName);
        // Checks if the image is there
        if (!data || !data.png)
            return;
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
    setParse(shouldParse) {
        this.canvasHolder.dataset.shouldParse = `${shouldParse}`.toLowerCase();
    }
    detatchAllEvents() {
        this.canvas.removeEventListener("mousedown", (e) => this.startDrag(e));
        this.canvas.removeEventListener("dblclick", (e) => this.select(e));
        document.removeEventListener("mousemove", (e) => this.drag(e));
        document.removeEventListener("mouseup", () => this.stopDrag());
        this.resizeHandle.removeEventListener("mousedown", (e) => this.startResize(e));
        document.removeEventListener("mousemove", (e) => this.outlineResize(e));
        document.removeEventListener("mouseup", (e) => this.resize(e));
        document.removeEventListener("mouseup", () => this.stopResize());
    }
    getMainHTMLElement() {
        return this.canvasHolder;
    }
    editable(isEditable) {
        if (!isEditable) {
            this.stopDrag();
            this.stopResize();
            this.detatchAllEvents();
            if (this.selected)
                this.unSelect();
        }
        else {
            this.initEvents();
        }
        this.resizeHandle.style.display = isEditable ? "block" : "none";
        this.canvasHolder.style.outline = isEditable ? `${config.settings.element_outline.value}px solid black` : "none";
        this.canvasHolder.style.border = isEditable ? `${config.settings.element_outline.value}px solid black` : "none";
        this.isEditable = isEditable;
    }
    delete() {
        if (!this.deleteable)
            return;
        if (this.selected)
            this.unSelect();
        this.container.removeChild(this.getMainHTMLElement());
        document.body.removeChild(this.outlineDiv);
        this.detach();
    }
    detach() {
        document.removeEventListener("mousemove", (e) => this.drag(e));
        document.removeEventListener("mouseup", () => this.stopDrag());
        document.removeEventListener("mousemove", (e) => this.outlineResize(e));
        document.removeEventListener("mouseup", (e) => this.resize(e));
        document.removeEventListener("mouseup", () => this.stopResize());
    }
    grid(showGrid) {
        ElementSharedFuncs.grid(showGrid, this);
    }
}
//# sourceMappingURL=canvas.js.map