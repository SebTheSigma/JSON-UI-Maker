import { DraggableCanvas } from "../../elements/canvas.js";
import { FileUploader } from "../../files/openFiles.js";
import { GLOBAL_ELEMENT_MAP, images } from "../../index.js";
import { StringUtil } from "../../util/stringUtil.js";
import { DraggableScrollingPanel } from "../../elements/scrollingPanel.js";

export class MinecraftSlider {
    public backgroundBar: HTMLElement;
    public scrollingPanel: DraggableScrollingPanel;
    public scrollBarWidth: number;
    public backgroundBarWidth: number;

    public imageName: string = "ScrollHandle";

    public offsetX: number = 0;
    public offsetY: number = 0;
    public isDragging: boolean;

    private handleCanvas: DraggableCanvas | undefined;

    constructor(scrollingPanel: DraggableScrollingPanel) {

        this.scrollBarWidth = 10;
        this.backgroundBarWidth = 6;

        this.scrollingPanel = scrollingPanel;
        this.backgroundBar = document.createElement("div");
        this.backgroundBar.className = "minecraft-slider";
        this.backgroundBar.style.height = `100%`;
        this.backgroundBar.style.width = `${this.backgroundBarWidth}px`;

        this.backgroundBar.style.position = "absolute";
        this.backgroundBar.style.right = `0px`;
        this.backgroundBar.style.top = "0px";

        this.backgroundBar.style.backgroundColor = "#434343";
        this.scrollingPanel.basePanel.appendChild(this.backgroundBar);

        this.handleCanvas = undefined;

        this.isDragging = false;

        this.initHandle();
    }

    public async initHandle(): Promise<void> {
        const imageData = images.get(this.imageName)!;
        if (!imageData) return;

        const id = StringUtil.generateRandomString(15);
        const canvas = new DraggableCanvas(id, this.backgroundBar, imageData.png!, this.imageName, imageData.json!);
        canvas.setParse(false);
        canvas.editable(false);

        GLOBAL_ELEMENT_MAP.set(id, canvas);
        this.handleCanvas = canvas;
        this.handleCanvas.canvas.style.transition = "height 0.5s ease";

        this.backgroundBar.style.zIndex = String(Number(this.scrollingPanel.resizeHandle.style.zIndex) - 1);
        this.handleCanvas.canvas.style.zIndex = String(Number(this.scrollingPanel.resizeHandle.style.zIndex) - 1);

        this.updateHandle();

        /*
        this.handleCanvas.canvas.addEventListener("mousedown", (e) => this.startManualBarScroll(e));
        document.addEventListener("mousemove", (e) => this.manualBarScroll(e));
        document.addEventListener("mouseup", () => this.stopManualBarScroll());
        */
    }

    public updateHandle(): void {
        if (this.isDragging) return;
        console.log(this.scrollBarWidth, this.backgroundBar.clientHeight * (this.scrollingPanel.panel.clientHeight / this.scrollingPanel.panel.scrollHeight));
        this.handleCanvas!.drawImage(
            this.scrollBarWidth,
            this.backgroundBar.clientHeight * (this.scrollingPanel.panel.clientHeight / this.scrollingPanel.panel.scrollHeight)
        );
        this.handleCanvas!.canvasHolder.style.left = `-${(this.scrollBarWidth - this.backgroundBarWidth) / 2}px`;
        this.handleCanvas!.canvasHolder.style.top = `${
            this.backgroundBar.clientHeight * (this.scrollingPanel.panel.scrollTop / this.scrollingPanel.panel.scrollHeight)
        }px`;
    }

    /*
    public startManualBarScroll(e: MouseEvent): void {
        e.stopPropagation();
        this.isDragging = true;

        // Get position relative to parent container
        const canvasRect: DOMRect = this.handleCanvas!.canvasHolder.getBoundingClientRect();

        this.offsetX = e.clientX - canvasRect.left;
        this.offsetY = e.clientY - canvasRect.top;
        e.preventDefault();
    }

    public manualBarScroll(e: MouseEvent): void {
        if (!this.isDragging) return;
        e.stopPropagation();

        const containerRect: DOMRect = this.scrollingPanel.basePanel.getBoundingClientRect();

        // Calculate position relative to parent container
        let newTop: number = e.clientY - containerRect.top - this.offsetY;

        // Constrain to container bounds
        newTop = Math.max(0, Math.min(newTop, containerRect.height - this.handleCanvas!.canvasHolder.offsetHeight));

        this.handleCanvas!.canvasHolder.style.top = `${newTop}px`;
        this.scrollingPanel.panel.scroll(0, (newTop / this.handleCanvas!.canvasHolder.offsetHeight) * this.scrollingPanel.panel.scrollHeight);
        e.preventDefault();
    }

    public stopManualBarScroll(): void {
        this.isDragging = false;
    }

    */

    public setMoveType(moveType: "smooth" | "instant"): void {
        this.handleCanvas!.canvas.style.transition = moveType === "smooth" ? "height 0.5s ease" : "none";
    }

    public delete(): void {
        this.handleCanvas!.delete();
        this.backgroundBar.remove();

        /*
        document.removeEventListener("mousemove", (e) => this.manualBarScroll(e));
        document.removeEventListener("mouseup", () => this.stopManualBarScroll());
        */
    }

    public hide(): void {
        this.backgroundBar.style.visibility = "hidden";
        this.handleCanvas?.hide();
    }

    public show(): void {
        this.backgroundBar.style.visibility = "visible";
        this.handleCanvas?.show();
    }
}
