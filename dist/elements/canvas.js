import { images, isInMainWindow, selectedElement, setSelectedElement } from "../index.js";
import { Nineslice } from "../nineslice.js";
import { config } from "../CONFIG.js";
import { keyboardEvent } from "../keyboard/eventListeners.js";
import { updatePropertiesArea } from "../ui/propertiesArea.js";
import { AllJsonUIElements } from "./elements.js";
import { StringUtil } from "../util/stringUtil.js";
export class DraggableCanvas {
    imageData;
    nineSlice;
    container;
    outlineDiv;
    canvasHolder;
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
    isEditable;
    bindings = "[]";
    /**
     * @param {HTMLElement} container
     */
    constructor(ID, container, imageData, imageName, nineSlice) {
        this.isEditable = true;
        let lastParent = container;
        let i = 0;
        parent_loop: while (true) {
            if (!lastParent)
                break parent_loop;
            lastParent = lastParent.parentElement;
            i++;
        }
        // Saves parameters
        this._constructorArgs = [ID, container, imageData, imageName, nineSlice];
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
        const rect = container.getBoundingClientRect();
        this.aspectRatio = imageData.width / imageData.height;
        this.canvas.style.width = `${imageData.width}px`;
        this.canvas.style.height = `${imageData.height}px`;
        this.canvas.width = imageData.width;
        this.canvas.height = imageData.height;
        // Gives it a filename that can be read later while converting
        this.canvasHolder.dataset.imageName = imageName;
        this.canvasHolder.dataset.id = ID;
        // Draws the image
        const ctx = this.canvas.getContext("2d");
        ctx.putImageData(this.imageData, 0, 0);
        // Always fits the image into the parent container
        if (rect.width > rect.height) {
            const scaledHeight = rect.height * 0.8;
            this.drawImage(scaledHeight * this.aspectRatio, scaledHeight);
        }
        else if (rect.width <= rect.height) {
            const scaledWidth = rect.width * 0.8;
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
        this.outlineDiv = document.createElement("div");
        this.outlineDiv.className = "outline-div";
        this.outlineDiv.style.border = "3px dotted rgb(0, 0, 0)";
        this.outlineDiv.style.position = "absolute";
        this.outlineDiv.style.zIndex = '1000';
        document.body.appendChild(this.outlineDiv);
        this.initEvents();
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
    }
    select(e) {
        if (!this.isEditable)
            return;
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
    unSelect(_e) {
        if (!this.isEditable)
            return;
        this.selected = false;
        setSelectedElement(undefined);
        this.canvasHolder.style.border = "2px solid black";
        this.canvasHolder.style.outline = "2px solid black";
        updatePropertiesArea();
        this.grid(false);
    }
    startDrag(e) {
        // Stop propagation for nested elements
        for (let elementName of AllJsonUIElements) {
            if (this.container.classList.contains(elementName)) {
                e.stopPropagation();
            }
        }
        if (e.target === this.resizeHandle || !this.isEditable)
            return;
        this.outlineDiv.style.display = "none";
        if (this.isResizing)
            this.stopResize();
        this.isDragging = true;
        // Get position relative to parent container
        const canvasRect = this.canvasHolder.getBoundingClientRect();
        this.offsetX = e.clientX - canvasRect.left;
        this.offsetY = e.clientY - canvasRect.top;
        this.canvas.style.cursor = "grabbing";
    }
    drag(e) {
        if (!this.isDragging || this.isResizing || !this.isEditable)
            return;
        const containerRect = this.container.getBoundingClientRect();
        if (config.settings.boundary_constraints.value) {
            let newLeft = e.clientX - containerRect.left - this.offsetX;
            let newTop = e.clientY - containerRect.top - this.offsetY;
            // Constrain to container bounds
            newLeft = Math.max(0, Math.min(newLeft, containerRect.width - Number(this.canvasHolder.style.width.replace("px", ""))));
            newTop = Math.max(0, Math.min(newTop, containerRect.height - Number(this.canvasHolder.style.height.replace("px", ""))));
            this.canvasHolder.style.left = `${newLeft}px`;
            this.canvasHolder.style.top = `${newTop}px`;
        }
        else {
            // Calculate position relative to parent container
            const newLeft = e.clientX - containerRect.left - this.offsetX;
            const newTop = e.clientY - containerRect.top - this.offsetY;
            this.canvasHolder.style.left = `${newLeft}px`;
            this.canvasHolder.style.top = `${newTop}px`;
        }
    }
    stopDrag() {
        this.isDragging = false;
        this.canvas.style.cursor = "grab";
        if (isInMainWindow)
            updatePropertiesArea();
    }
    startResize(e) {
        e.stopPropagation(); // Prevent event from bubbling to parent
        if (!this.isEditable)
            return;
        this.isResizing = true;
        this.resizeStartWidth = parseFloat(this.canvas.style.width);
        this.resizeStartHeight = parseFloat(this.canvas.style.height);
        this.resizeStartX = e.clientX;
        this.resizeStartY = e.clientY;
        const rect = this.canvasHolder.getBoundingClientRect();
        this.outlineDiv.style.top = `${rect.top + window.scrollY}px`;
        this.outlineDiv.style.left = `${rect.left + window.scrollX}px`;
        this.outlineDiv.style.display = "block";
        e.preventDefault();
    }
    resize(e) {
        e.stopPropagation(); // Prevent event from bubbling to parent
        if (!this.isResizing || !this.isEditable)
            return;
        const containerRect = this.container.getBoundingClientRect();
        const widthChange = e.clientX - this.resizeStartX;
        const heightChange = e.clientY - this.resizeStartY;
        let newWidth;
        let newHeight;
        // If shift key is pressed, maintain aspect ratio,
        // only if the image is a 9-slice
        if (keyboardEvent?.shiftKey || !this.nineSlice) {
            newWidth = this.resizeStartWidth + widthChange;
            newHeight = newWidth / this.aspectRatio;
            if (config.settings.boundary_constraints.value) {
                // Determine the maximum possible width while maintaining aspect ratio
                const maxWidth = containerRect.width - parseFloat(this.canvasHolder.style.left);
                const maxHeight = containerRect.height - parseFloat(this.canvasHolder.style.top);
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
        e.stopPropagation(); // Prevent event from bubbling to parent
        if (!this.isResizing || !this.isEditable)
            return;
        const containerRect = this.container.getBoundingClientRect();
        const widthChange = e.clientX - this.resizeStartX;
        const heightChange = e.clientY - this.resizeStartY;
        let newWidth;
        let newHeight;
        // If shift key is pressed, maintain aspect ratio,
        // only if the image is a 9-slice
        if (keyboardEvent?.shiftKey || !this.nineSlice) {
            newWidth = this.resizeStartWidth + widthChange;
            newHeight = newWidth / this.aspectRatio;
            if (config.settings.boundary_constraints.value) {
                // Determine the maximum possible width while maintaining aspect ratio
                const maxWidth = containerRect.width - parseFloat(this.canvasHolder.style.left);
                const maxHeight = containerRect.height - parseFloat(this.canvasHolder.style.top);
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
        this.outlineDiv.style.width = `${newWidth - (StringUtil.cssDimToNumber(this.outlineDiv.style.borderWidth))}px`;
        this.outlineDiv.style.height = `${newHeight - (StringUtil.cssDimToNumber(this.outlineDiv.style.borderWidth))}px`;
    }
    stopResize() {
        this.isResizing = false;
        this.outlineDiv.style.display = "none";
        if (isInMainWindow)
            updatePropertiesArea();
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
    detatchEvents() {
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
            this.detatchEvents();
            if (this.selected)
                this.unSelect();
        }
        else {
            this.initEvents();
        }
        this.resizeHandle.style.display = isEditable ? "block" : "none";
        this.canvasHolder.style.outline = isEditable ? "2px solid black" : "none";
        this.canvasHolder.style.border = isEditable ? "2px solid black" : "none";
        this.isEditable = isEditable;
    }
    delete() {
        if (this.selected)
            this.unSelect();
        this.container.removeChild(this.getMainHTMLElement());
        document.body.removeChild(this.outlineDiv);
        document.removeEventListener("mousemove", (e) => this.drag(e));
        document.removeEventListener("mouseup", () => this.stopDrag());
        document.removeEventListener("mousemove", (e) => this.outlineResize(e));
        document.removeEventListener("mouseup", (e) => this.resize(e));
        document.removeEventListener("mouseup", () => this.stopResize());
    }
    grid(showGrid) {
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
//# sourceMappingURL=canvas.js.map