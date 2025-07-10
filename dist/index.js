import { Converter } from "./converter.js";
import { handlePackUpload } from "./files/openFiles.js";
console.log('Script Loaded');
/**
 * @type {KeyboardEvent}
 */
export let keyboardEvent = new KeyboardEvent("keypress");
window.addEventListener("keydown", (e) => {
    keyboardEvent = e;
});
window.addEventListener("keypress", (e) => {
    keyboardEvent = e;
});
window.addEventListener("keyup", (e) => {
    keyboardEvent = e;
});
export let selectedElement = undefined;
export const config = {
    boundary_constraints: false,
};
export class DraggablePanel {
    container;
    panel;
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
    /**
     * @param {HTMLElement} container
     */
    constructor(container) {
        let lastParent = container;
        let i = 0;
        parent_loop: while (true) {
            if (!lastParent)
                break parent_loop;
            lastParent = lastParent.parentElement;
            i++;
        }
        this.container = container;
        this.panel = document.createElement("div");
        this.panel.className = "draggable-panel";
        const rect = container.getBoundingClientRect();
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
    initEvents() {
        this.panel.addEventListener("mousedown", (e) => this.startDrag(e));
        this.panel.addEventListener("dblclick", (e) => this.select(e));
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
            if (selectedElement !== this.panel) {
                selectedElement.style.border = "2px solid black";
                this.selected = true;
                selectedElement = this.panel;
                this.panel.style.border = "2px solid blue";
                return;
            }
        }
        if (this.selected) {
            this.unSelect(e);
            return;
        }
        this.selected = true;
        selectedElement = this.panel;
        this.panel.style.border = "2px solid blue";
    }
    unSelect(_e) {
        this.selected = false;
        selectedElement = undefined;
        this.panel.style.border = "2px solid black";
    }
    startDrag(e) {
        if (e.target === this.resizeHandle)
            return;
        // Stop propagation for nested panels
        if (this.container.classList.contains("draggable-panel")) {
            e.stopPropagation();
        }
        this.isDragging = true;
        // Get position relative to parent container
        const panelRect = this.panel.getBoundingClientRect();
        this.offsetX = e.clientX - panelRect.left;
        this.offsetY = e.clientY - panelRect.top;
        this.panel.style.cursor = "grabbing";
    }
    drag(e) {
        if (!this.isDragging || this.isResizing)
            return;
        const containerRect = this.container.getBoundingClientRect();
        if (config["boundary_constraints"]) {
            console.log("Boudary");
            let newLeft = e.clientX - containerRect.left - this.offsetX;
            let newTop = e.clientY - containerRect.top - this.offsetY;
            // Constrain to container bounds
            newLeft = Math.max(0, Math.min(newLeft, containerRect.width - this.panel.offsetWidth));
            newTop = Math.max(0, Math.min(newTop, containerRect.height - this.panel.offsetHeight));
            this.panel.style.left = `${newLeft}px`;
            this.panel.style.top = `${newTop}px`;
        }
        else {
            // Calculate position relative to parent container
            const newLeft = e.clientX - containerRect.left - this.offsetX;
            const newTop = e.clientY - containerRect.top - this.offsetY;
            this.panel.style.left = `${newLeft}px`;
            this.panel.style.top = `${newTop}px`;
        }
    }
    stopDrag() {
        this.isDragging = false;
        this.panel.style.cursor = "grab";
    }
    startResize(e) {
        e.stopPropagation(); // Prevent event from bubbling to parent
        this.isResizing = true;
        this.resizeStartWidth = parseFloat(this.panel.style.width);
        this.resizeStartHeight = parseFloat(this.panel.style.height);
        this.resizeStartX = e.clientX;
        this.resizeStartY = e.clientY;
        e.preventDefault();
    }
    resize(e) {
        if (!this.isResizing)
            return;
        e.stopPropagation(); // Prevent event from bubbling to parent
        const widthChange = e.clientX - this.resizeStartX;
        const heightChange = e.clientY - this.resizeStartY;
        this.panel.style.width = `${this.resizeStartWidth + widthChange}px`;
        this.panel.style.height = `${this.resizeStartHeight + heightChange}px`;
    }
    stopResize() {
        this.isResizing = false;
    }
}
export class DraggableCanvas {
    imageData;
    nineSlice;
    container;
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
    /**
     * @param {HTMLElement} container
     */
    constructor(container, imageData, imageName, nineSlice) {
        console.log(`Dimensions: ${imageData.width} ${imageData.height}`);
        let lastParent = container;
        let i = 0;
        parent_loop: while (true) {
            if (!lastParent)
                break parent_loop;
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
        const rect = container.getBoundingClientRect();
        this.aspectRatio = imageData.width / imageData.height;
        this.canvas.style.width = `${imageData.width}px`;
        this.canvas.style.height = `${imageData.height}px`;
        this.canvas.width = imageData.width;
        this.canvas.height = imageData.height;
        // Gives it a filename that can be read later while converting
        this.canvas.imageName = imageName;
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
        this.initEvents();
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
            if (selectedElement !== this.canvasHolder) {
                selectedElement.style.border = "2px solid black";
                this.selected = true;
                selectedElement = this.canvasHolder;
                this.canvasHolder.style.border = "2px solid blue";
                return;
            }
        }
        if (this.selected) {
            this.unSelect(e);
            return;
        }
        this.selected = true;
        selectedElement = this.canvasHolder;
        this.canvasHolder.style.border = "2px solid blue";
    }
    unSelect(_e) {
        this.selected = false;
        selectedElement = undefined;
        this.canvasHolder.style.border = "2px solid black";
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
        const canvasRect = this.canvasHolder.getBoundingClientRect();
        this.offsetX = e.clientX - canvasRect.left;
        this.offsetY = e.clientY - canvasRect.top;
        this.canvas.style.cursor = "grabbing";
    }
    drag(e) {
        if (!this.isDragging || this.isResizing)
            return;
        const containerRect = this.container.getBoundingClientRect();
        if (config["boundary_constraints"]) {
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
        if (keyboardEvent?.shiftKey || !this.nineSlice) {
            newWidth = this.resizeStartWidth + widthChange;
            newHeight = newWidth / this.aspectRatio;
            if (config["boundary_constraints"]) {
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
    stopResize() {
        this.isResizing = false;
    }
    /**
     *
     * @param {number} width
     * @param {number} height
     */
    drawImage(width, height) {
        if (this.nineSlice) {
            // Stops the canvas from being too small
            if (width <= 1)
                width = 1;
            if (height <= 1)
                height = 1;
            const pixels = Nineslice.ninesliceResize(this.nineSlice, this.imageData.data, Math.floor(width), Math.floor(height));
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
        this.canvasHolder.style.width = `${width}px`;
        this.canvasHolder.style.height = `${height}px`;
    }
}
export class Nineslice {
    static ninesliceResize({ nineslice_size, base_size }, pixelArray, newWidth, newHeight) {
        const [left, top, right, bottom] = nineslice_size;
        const [baseWidth, baseHeight] = base_size;
        const output = new Uint8ClampedArray(newWidth * newHeight * 4);
        function getPixel(x, y) {
            x = Math.max(0, Math.min(baseWidth - 1, x));
            y = Math.max(0, Math.min(baseHeight - 1, y));
            const idx = (y * baseWidth + x) * 4;
            return [pixelArray[idx] ?? 0, pixelArray[idx + 1] ?? 0, pixelArray[idx + 2] ?? 0, pixelArray[idx + 3] ?? 255];
        }
        function setPixel(x, y, rgba) {
            if (x < 0 || y < 0 || x >= newWidth || y >= newHeight)
                return;
            const idx = (y * newWidth + x) * 4;
            for (let i = 0; i < 4; i++) {
                output[idx + i] = rgba[i];
            }
        }
        function stretch(srcX, srcY, srcW, srcH, destX, destY, destW, destH) {
            for (let y = 0; y < destH; y++) {
                const sampleY = srcH === 1 ? srcY : srcY + Math.floor((y * srcH) / destH);
                for (let x = 0; x < destW; x++) {
                    const sampleX = srcW === 1 ? srcX : srcX + Math.floor((x * srcW) / destW);
                    const pixel = getPixel(sampleX, sampleY);
                    setPixel(destX + x, destY + y, pixel);
                }
            }
        }
        // Calculate middle region sizes
        const midSrcW = baseWidth - left - right;
        const midSrcH = baseHeight - top - bottom;
        const midDestW = newWidth - left - right;
        const midDestH = newHeight - top - bottom;
        // Top-left corner
        stretch(0, 0, left, top, 0, 0, left, top);
        // Top-middle edge
        stretch(left, 0, midSrcW, top, left, 0, midDestW, top);
        // Top-right corner
        stretch(baseWidth - right, 0, right, top, newWidth - right, 0, right, top);
        // Middle-left edge
        stretch(0, top, left, midSrcH, 0, top, left, midDestH);
        // Center
        stretch(left, top, midSrcW, midSrcH, left, top, midDestW, midDestH);
        // Middle-right edge
        stretch(baseWidth - right, top, right, midSrcH, newWidth - right, top, right, midDestH);
        // Bottom-left corner
        stretch(0, baseHeight - bottom, left, bottom, 0, newHeight - bottom, left, bottom);
        // Bottom-middle edge
        stretch(left, baseHeight - bottom, midSrcW, bottom, left, newHeight - bottom, midDestW, bottom);
        // Bottom-right corner
        stretch(baseWidth - right, baseHeight - bottom, right, bottom, newWidth - right, newHeight - bottom, right, bottom);
        return output;
    }
}
export const panelContainer = document.getElementById("main_window");
export class Builder {
    static addPanel() {
        new DraggablePanel(selectedElement ?? panelContainer);
    }
    static addCanvas(imageData, imageName, nineSlice) {
        new DraggableCanvas(selectedElement ?? panelContainer, imageData, imageName, nineSlice);
    }
    static reset() {
        selectedElement = undefined;
        panelContainer.innerHTML = `<img src="background.png" width="100%" height="100%" class="bg_image" id="bg_image">`;
    }
    static deleteSelected() {
        selectedElement.remove();
        selectedElement = undefined;
    }
    static changeSettingToggle(setting) {
        config[setting] = !config[setting];
        console.log(`Settings: ${JSON.stringify(config)}`);
    }
    static addImage(imageName) {
        const imageData = images.get(imageName);
        // Checks if the image is there
        if (!imageData?.png)
            return;
        // Checks if the image is a nineslice
        this.addCanvas(imageData.png, imageName, imageData.json);
    }
}
export function initProperties() {
    const properties = document.getElementById("properties");
    let changingNode;
    for (let node of Array.from(properties.childNodes)) {
        if (node instanceof HTMLInputElement) {
            node.addEventListener("input", function () {
                // Makes sure there is a selected element
                if (selectedElement) {
                    changingNode = node;
                    // Assigns the typed value the the style value
                    selectedElement.style[node.id.replace("properties_", "")] = node.value;
                }
            });
            // Resets the changingNode when the user leaves the text box
            node.addEventListener("blur", function () {
                // Makes sure there is a selected element
                if (selectedElement) {
                    changingNode = undefined;
                }
            });
        }
    }
    // Keeps the values of the selected element synced with the text box values
    setInterval(() => {
        for (let node of Array.from(properties.childNodes)) {
            if (node instanceof HTMLInputElement) {
                if (changingNode == node)
                    continue;
                try {
                    node.value = selectedElement?.style[node.id.replace("properties_", "")] ?? "None";
                }
                catch {
                    node.value = "None";
                }
            }
        }
    }, 50);
}
initProperties();
export var images = new Map();
export function updateImageDropdown() {
    const dropdown = document.getElementById("addImageDropdown");
    // Removes all dropdown options
    dropdown.innerHTML = "";
    // Adds the dropdown options
    for (const [fileName, data] of images.entries()) {
        console.log(fileName);
        const fileNameText = document.createElement("div");
        fileNameText.className = "dropdownContent";
        fileNameText.textContent = fileName;
        fileNameText.onclick = function () {
            Builder.addImage(fileName);
        };
        dropdown.appendChild(fileNameText);
    }
}
window.handlePackUpload = handlePackUpload;
window.Builder = Builder;
window.Converter = Converter;
//# sourceMappingURL=index.js.map