/**
 * @type {KeyboardEvent}
 */
export let keyboardEvent: KeyboardEvent = new KeyboardEvent("keypress");

window.addEventListener("keydown", (e) => {
    keyboardEvent = e;
});

window.addEventListener("keypress", (e) => {
    keyboardEvent = e;
});

window.addEventListener("keyup", (e) => {
    keyboardEvent = e;
});

export let selectedElement: HTMLElement | undefined = undefined;

export const config = {
    boundary_constraints: false,
};

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

    public unSelect(_e?: MouseEvent): void {
        this.selected = false;
        selectedElement = undefined;
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

        if (config["boundary_constraints"]) {
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

export interface NinesliceData {
    nineslice_size: [left: number, top: number, right: number, bottom: number];
    base_size: [width: number, height: number];
}

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
    public constructor(container: HTMLElement, imageData: ImageData, nineSlice?: NinesliceData) {
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

        // Creates the canvas and puts it in the canvas holder
        this.canvas = document.createElement("canvas");

        const rect: DOMRect = container.getBoundingClientRect();

        this.aspectRatio = imageData.width / imageData.height;
        this.canvas.style.width = `${imageData.width}px`;
        this.canvas.style.height = `${imageData.height}px`;
        this.canvas.width = imageData.width;
        this.canvas.height = imageData.height;

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

    public unSelect(_e?: MouseEvent): void {
        this.selected = false;
        selectedElement = undefined;
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

        let newWidth: number = this.resizeStartWidth! + widthChange;
        let newHeight: number = newWidth / this.aspectRatio;

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
        this.canvas.width = Math.floor(width);
        this.canvas.height = Math.floor(height);

        if (this.nineSlice) {
            const pixels: Uint8ClampedArray<ArrayBuffer> = Nineslice.ninesliceResize(
                this.nineSlice,
                this.imageData.data,
                Math.floor(width),
                Math.floor(height)
            );
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

export class Nineslice {
    public static ninesliceResize(
        { nineslice_size, base_size }: NinesliceData,
        pixelArray: Uint8ClampedArray<ArrayBufferLike>,
        newWidth: number,
        newHeight: number
    ): Uint8ClampedArray<ArrayBuffer> {
        const [left, top, right, bottom] = nineslice_size;
        const [baseWidth, baseHeight] = base_size;

        const output: Uint8ClampedArray<ArrayBuffer> = new Uint8ClampedArray(newWidth * newHeight * 4);

        function getPixel(x: number, y: number): [r: number, g: number, b: number, a: number] {
            x = Math.max(0, Math.min(baseWidth - 1, x));
            y = Math.max(0, Math.min(baseHeight - 1, y));
            const idx: number = (y * baseWidth + x) * 4;
            return [pixelArray[idx] ?? 0, pixelArray[idx + 1] ?? 0, pixelArray[idx + 2] ?? 0, pixelArray[idx + 3] ?? 255];
        }

        function setPixel(x: number, y: number, rgba: [r: number, g: number, b: number, a: number]): void {
            if (x < 0 || y < 0 || x >= newWidth || y >= newHeight) return;
            const idx: number = (y * newWidth + x) * 4;
            for (let i: number = 0; i < 4; i++) {
                output[idx + i] = rgba[i]!;
            }
        }

        function stretch(srcX: number, srcY: number, srcW: number, srcH: number, destX: number, destY: number, destW: number, destH: number): void {
            for (let y: number = 0; y < destH; y++) {
                const sampleY: number = srcH === 1 ? srcY : srcY + Math.floor((y * srcH) / destH);
                for (let x: number = 0; x < destW; x++) {
                    const sampleX: number = srcW === 1 ? srcX : srcX + Math.floor((x * srcW) / destW);

                    const pixel: [r: number, g: number, b: number, a: number] = getPixel(sampleX, sampleY);

                    setPixel(destX + x, destY + y, pixel);
                }
            }
        }

        // Calculate middle region sizes
        const midSrcW: number = baseWidth - left - right;
        const midSrcH: number = baseHeight - top - bottom;
        const midDestW: number = newWidth - left - right;
        const midDestH: number = newHeight - top - bottom;

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

export const panelContainer: HTMLElement | null = document.getElementById("main_window");

export class Builder {
    public static addPanel(): void {
        new DraggablePanel(selectedElement ?? panelContainer!);
    }

    public static addCanvas(imageData: ImageData, nineSlice?: NinesliceData): void {
        new DraggableCanvas(selectedElement ?? panelContainer!, imageData, nineSlice);
    }

    public static reset(): void {
        selectedElement = undefined;
        panelContainer!.innerHTML = `<img src="background.png" width="100%" height="100%" class="bg_image" id="bg_image">`;
    }

    public static deleteSelected(): void {
        selectedElement!.remove();
        selectedElement = undefined;
    }

    public static changeSettingToggle(setting: keyof typeof config): void {
        config[setting] = !config[setting];

        console.log(`Settings: ${JSON.stringify(config)}`);
    }

    public static addImage(imageName: string): void {
        const imageData: ReturnType<typeof images.get> = images.get(imageName);

        // Checks if the image is there
        if (!imageData?.png) return;

        // Checks if the image is a nineslice
        this.addCanvas(imageData.png, imageData.json);
    }
}

export function initProperties(): void {
    const properties: HTMLElement = document.getElementById("properties")!;

    let changingNode: Node | undefined;

    for (let node of Array.from(properties.childNodes)) {
        if (node instanceof HTMLInputElement) {
            node.addEventListener("input", function () {
                // Makes sure there is a selected element
                if (selectedElement) {
                    changingNode = node;

                    // Assigns the typed value the the style value
                    selectedElement.style[node.id.replace("properties_", "") as any] = node.value;
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
                if (changingNode == node) continue;
                try {
                    node.value = (selectedElement?.style[node.id.replace("properties_", "") as keyof CSSStyleDeclaration] as string | undefined) ?? "None";
                } catch {
                    node.value = "None";
                }
            }
        }
    }, 50);
}

initProperties();

export var images: Map<string, { png?: ImageData; json?: NinesliceData }> = new Map();

export function updateImageDropdown(): void {
    const dropdown: HTMLElement = document.getElementById("addImageDropdown")!;

    // Removes all dropdown options
    dropdown.innerHTML = "";

    // Adds the dropdown options
    for (const [fileName, data] of images.entries()) {
        console.log(fileName);

        const fileNameText: HTMLDivElement = document.createElement("div");
        fileNameText.className = "dropdownContent";
        fileNameText.textContent = fileName;
        fileNameText.onclick = function () {
            Builder.addImage(fileName);
        };

        dropdown.appendChild(fileNameText);
    }
}

export function handleImageUpload(): void {
    const fileInput: HTMLInputElement | null = document.getElementById("pack_importer") as HTMLInputElement | null;
    if (!fileInput?.files) return;
    const files: File[] = Array.from(fileInput.files);

    for (let file of files) {
        console.log(file.name);
    }

    for (let file of files.filter((img) => img.name.endsWith(".png"))) {
        /*Removes the file extension */
        const fileNameNoExtension: string = file.name.replace(/\.[^.]*$/, "");

        // Looks for a json file
        const jsonFile: File | undefined = files.filter((json) => json.name == `${fileNameNoExtension}.json`)[0];

        const imgReader: FileReader = new FileReader();

        if (jsonFile) {
            // Gets the text from the json file
            const jsonReader: FileReader = new FileReader();

            jsonReader.onload = function (e) {
                const text: string = jsonReader.result as string;
                console.log(`Json: ${JSON.stringify(text)}`);

                // Adds the json data to the images map
                const nineSliceData: ReturnType<typeof images.get> = images.get(fileNameNoExtension);
                if (nineSliceData) {
                    nineSliceData.json = JSON.parse(text);

                    images.set(fileNameNoExtension, nineSliceData);
                }

                // If the image hasnt loaded yet it creates the nineslice data
                else {
                    images.set(fileNameNoExtension, { json: JSON.parse(text) });
                }

                updateImageDropdown();
            };

            jsonReader.readAsText(jsonFile);
        }

        imgReader.onload = function (e: ProgressEvent<FileReader>): void {
            const img: HTMLImageElement = new Image();
            img.onload = function (): void {
                // Create canvas to draw image on
                const canvas: HTMLCanvasElement = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;

                const ctx: CanvasRenderingContext2D = canvas.getContext("2d")!;
                ctx.drawImage(img, 0, 0);

                // Get pixel data
                const imageData: ImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

                // Adds the img data to the images map
                const nineSliceData: ReturnType<typeof images.get> = images.get(fileNameNoExtension);
                if (nineSliceData) {
                    nineSliceData.png = imageData;

                    images.set(fileNameNoExtension, nineSliceData);
                }

                // If the json hasnt loaded yet it creates the nineslice data
                else {
                    images.set(fileNameNoExtension, {
                        png: imageData,
                    });
                }

                updateImageDropdown();
                console.log(JSON.stringify(images.get("melt")));
            };

            img.src = e.target!.result as string;
        };

        imgReader.readAsDataURL(file);
    }
}

declare global {
    namespace globalThis {
        function handleImageUpload(): void;
    }
}

window.handleImageUpload = handleImageUpload;
