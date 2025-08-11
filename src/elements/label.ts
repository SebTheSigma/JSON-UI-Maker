import { isInMainWindow, panelContainer, selectedElement, setSelectedElement } from "../index.js";
import { config } from "../CONFIG.js";
import { updatePropertiesArea } from "../ui/propertiesArea.js";
import { AllJsonUIElements } from "./elements.js";
import { StringUtil } from "../util/stringUtil.js";

interface LabelOptions {
    text: string;
    textAlign?: 'left' | 'right' | 'center';
    fontScale?: number;
    fontColor?: [number, number, number];
}

export class DraggableLabel {
    public container: HTMLElement;
    public basePanel: HTMLElement;
    public label: HTMLTextAreaElement;
    public mirror: HTMLElement;
    public isDragging: boolean;
    public selected: boolean;
    public offsetX: number;
    public offsetY: number;
    public hasShadow: boolean = false;
    public shadowLabel: HTMLDivElement;

    public shadowOffsetX: number;
    public shadowOffsetY: number;

    /**
     * @param {HTMLElement} container
     */
    public constructor(ID: string, container: HTMLElement, labelOptions?: LabelOptions) {
        let lastParent: HTMLElement | null = container;
        let i: number = 0;
        parent_loop: while (true) {
            if (!lastParent) break parent_loop;
            lastParent = lastParent.parentElement;
            i++;
        }

        // Saves parameters
        (this as any)._constructorArgs = [ID, container, labelOptions];

        this.container = container;

        this.shadowOffsetX = 6;
        this.shadowOffsetY = 6;

        const textAlign = labelOptions?.textAlign ?? "left";
        const fontSize = labelOptions?.fontScale ?? 1;
        const fontColor = labelOptions?.fontColor ?? [255, 255, 255];

        this.basePanel = document.createElement("div");
        this.basePanel.style.position = "absolute";
        this.basePanel.style.resize = "none";

        this.basePanel.style.minWidth = "10px";
        this.basePanel.style.minHeight = "20px";
        this.basePanel.style.maxWidth = `${panelContainer.getBoundingClientRect().width}px`;

        this.basePanel.dataset.skip = "true";

        // Create the textarea
        this.label = document.createElement("textarea");
        this.label.value = labelOptions ? labelOptions.text : "";
        this.label.className = "draggable-label";
        this.label.style.overflow = "hidden";
        this.label.style.resize = "none";
        this.label.style.minWidth = "10px";
        this.label.style.minHeight = "20px";
        this.label.style.maxWidth = `${panelContainer.getBoundingClientRect().width}px`;
        this.label.style.border = "2px solid black";
        this.label.style.font = "16px sans-serif";
        this.label.style.padding = "4px";
        this.label.wrap = "off";
        this.label.name = 'label';
        this.label.style.color = "white";
        this.label.style.fontFamily = 'MinecraftRegular';
        this.label.spellcheck = false;
        this.label.style.color = `rgb(${fontColor[0], fontColor[1], fontColor[2]})`;

        // Create a hidden mirror for sizing
        this.mirror = document.createElement("div");
        this.mirror.style.position = "absolute";
        this.mirror.style.width = "fit-content";
        this.mirror.style.visibility = "hidden";
        this.mirror.style.whiteSpace = "pre-wrap";
        this.mirror.style.wordWrap = "break-word";
        this.mirror.style.font = this.label.style.font;
        this.mirror.style.fontFamily = this.label.style.fontFamily;
        this.mirror.style.padding = this.label.style.padding;
        this.mirror.style.border = this.label.style.border;
        this.mirror.style.boxSizing = "border-box";
        this.basePanel.appendChild(this.mirror);

        // Properties
        this.label.style.textAlign = textAlign;
        this.label.style.fontSize = `${fontSize}em`;
        
        this.mirror.style.textAlign = textAlign;
        this.mirror.style.fontSize = `${fontSize}em`;

        // Custom data
        this.label.dataset.id = ID;

        const parentRect: DOMRect = container.getBoundingClientRect();
        const rect: DOMRect = this.label.getBoundingClientRect();

        console.log(`Left: ${rect.left}, Top: ${rect.top}`);
        console.log(`Width: ${rect.width}, Height: ${rect.height}`);

        this.label.style.left = `${parentRect.width / 2}px`;
        this.label.style.top = `${parentRect.height / 2}px`;

        this.label.style.backgroundColor = "rgba(255, 255, 255, 0)";
        this.label.style.position = "absolute";
        this.label.style.zIndex = String((2 * i) + 1);

        this.basePanel.appendChild(this.label);

        this.isDragging = false;
        this.selected = false;
        this.offsetX = 0;
        this.offsetY = 0;

        // Shadow label
        this.shadowLabel = document.createElement("div");
        this.shadowLabel.style.position = "absolute";
        this.shadowLabel.style.zIndex = String(2 * i);
        this.shadowLabel.style.color = "rgba(0, 0, 0, 0.5)";
        this.shadowLabel.style.display = 'none';
        this.shadowLabel.style.fontFamily = this.label.style.fontFamily;

        this.shadowLabel.style.whiteSpace = "pre-wrap";
        this.shadowLabel.style.wordWrap = "break-word";

        const offset = config.magicNumbers.labelToOffset(this.label);
        this.shadowLabel.style.left = `${StringUtil.cssDimToNumber(this.label.style.left) + this.shadowOffsetX + offset[0]}px`;
        this.shadowLabel.style.top = `${StringUtil.cssDimToNumber(this.label.style.top) + this.shadowOffsetY + offset[1]}px`;

        this.basePanel.appendChild(this.shadowLabel);
        this.container.appendChild(this.basePanel);

        this.initEvents();
    }

    public updateSize(updateProperties: boolean = true): void {
        const lines = this.label.value.split("\n");

        // If making a new line
        if (this.hasShadow) {
            if (lines.at(-1) === "") this.shadowLabel.style.display = 'none';
            else this.shadowLabel.style.display = 'block';
        }
        
        this.mirror.textContent = this.label.value || " ";
        this.shadowLabel.textContent = this.label.value || " ";
        const mirrorRect = this.mirror.getBoundingClientRect();
        const scalar = parseFloat(this.label.style.fontSize);
        console.warn(`Scalar: ${scalar}`);
        this.label.style.width = `${mirrorRect.width}px`;
        this.label.style.height = `${mirrorRect.height}px`;

        const offset = config.magicNumbers.labelToOffset(this.label);

        console.log(`shadow offset x: ${this.shadowOffsetX}, shadow offset y: ${this.shadowOffsetY}`);
        const labelRect = this.label.getBoundingClientRect();

        console.log(`label width: ${labelRect.width}, label height: ${labelRect.height} mirror width: ${mirrorRect.width}, mirror height: ${mirrorRect.height}`);
        this.shadowLabel.style.width = `${labelRect.width}px`;
        this.shadowLabel.style.height = `${labelRect.height}px`;
        
        if (updateProperties) updatePropertiesArea();

        this.shadowLabel.style.left = `${StringUtil.cssDimToNumber(this.label.style.left) + this.shadowOffsetX + offset[0]}px`;
        this.shadowLabel.style.top = `${StringUtil.cssDimToNumber(this.label.style.top) + this.shadowOffsetY + offset[1]}px`;
    };

    public initEvents(): void {
        this.label.addEventListener("mousedown", (e) => this.startDrag(e));
        this.label.addEventListener("dblclick", (e) => this.select(e));
        document.addEventListener("mousemove", (e) => this.drag(e));
        document.addEventListener("mouseup", () => this.stopDrag());

        // Initial size
        this.updateSize();

        // Auto-resize on input
        this.label.addEventListener("input", () => this.updateSize());
    }

    public select(e: MouseEvent): void {
        e.stopPropagation(); // Prevent the event from bubbling up to the parent

        if (selectedElement) {
            if (selectedElement !== this.label) {
                selectedElement.style.border = "2px solid black";
                selectedElement.style.outline = "2px solid black";
                this.selected = true;
                setSelectedElement(this.label);
                this.label.style.border = "2px solid blue";
                this.label.style.outline = "2px solid blue";
                updatePropertiesArea();
                return;
            }
        }

        if (this.selected) {
            this.unSelect(e);
            return;
        }

        this.selected = true;
        setSelectedElement(this.label);
        this.label.style.border = "2px solid blue";
        this.label.style.outline = "2px solid blue";

        updatePropertiesArea();
    }

    public unSelect(_e?: MouseEvent): void {
        this.selected = false;
        setSelectedElement(undefined);
        this.label.style.border = "2px solid black";
        this.label.style.outline = "2px solid black";
        updatePropertiesArea()
    }

    public startDrag(e: MouseEvent): void {
        // Stop propagation for nested elements
        for (let elementName of AllJsonUIElements) {
            if (this.container.classList.contains(elementName)) {
                e.stopPropagation();
            }
        }

        this.isDragging = true;

        // Get position relative to parent container
        const labelRect: DOMRect = this.label.getBoundingClientRect();

        this.offsetX = e.clientX - labelRect.left;
        this.offsetY = e.clientY - labelRect.top;

        this.label.style.cursor = "grabbing";
    }

    public drag(e: MouseEvent): void {
        e.stopPropagation();
        if (!this.isDragging) return;
        const containerRect: DOMRect = this.container.getBoundingClientRect();

        if (config.settings.boundary_constraints!.value) {
            let newLeft: number = e.clientX - containerRect.left - this.offsetX;
            let newTop: number = e.clientY - containerRect.top - this.offsetY;

            // Constrain to container bounds
            newLeft = Math.max(0, Math.min(newLeft, containerRect.width - this.label.offsetWidth));
            newTop = Math.max(0, Math.min(newTop, containerRect.height - this.label.offsetHeight));
            console.log(1, newLeft, containerRect.width, this.label.offsetWidth);
            console.log(2, newTop, containerRect.height, this.label.offsetHeight);

            this.label.style.left = `${newLeft}px`;
            this.label.style.top = `${newTop - config.magicNumbers.resizeHandleSize}px`;
        } else {
            // Calculate position relative to parent container
            const newLeft: number = e.clientX - containerRect.left - this.offsetX;
            const newTop: number = e.clientY - containerRect.top - this.offsetY;

            this.label.style.left = `${newLeft}px`;
            this.label.style.top = `${newTop - config.magicNumbers.resizeHandleSize}px`;
        }

        const offset = config.magicNumbers.labelToOffset(this.label);
        this.shadowLabel.style.left = `${StringUtil.cssDimToNumber(this.label.style.left) + this.shadowOffsetX + offset[0]}px`;
        this.shadowLabel.style.top = `${StringUtil.cssDimToNumber(this.label.style.top) + this.shadowOffsetY + offset[1]}px`;
    }

    public stopDrag(): void {
        this.isDragging = false;
        this.label.style.cursor = "grab";
        if (isInMainWindow) updatePropertiesArea();
    }

    public setParse(shouldParse: boolean): void {
        this.label.dataset.shouldParse = `${shouldParse}`.toLowerCase();
    }

    public changeText(text: string): void {
        this.label.textContent = text;
        this.mirror.textContent = text;
        this.shadowLabel.textContent = text;
    }

    public getMainHTMLElement(): HTMLElement {
        return this.label;
    }

    public delete(): void {

        if (this.selected) this.unSelect();

        this.container.removeChild(this.basePanel);

        document.removeEventListener("mousemove", (e) => this.drag(e));
        document.removeEventListener("mouseup", () => this.stopDrag());
    }

    public shadow(shouldShadow: boolean): void {
        this.hasShadow = shouldShadow;

        this.shadowLabel.style.display = shouldShadow ? "block" : "none";
    }
}
