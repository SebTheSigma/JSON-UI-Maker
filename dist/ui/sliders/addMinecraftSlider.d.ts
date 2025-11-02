import { DraggableScrollingPanel } from "../../elements/scrollingPanel.js";
export declare class MinecraftSlider {
    backgroundBar: HTMLElement;
    scrollingPanel: DraggableScrollingPanel;
    scrollBarWidth: number;
    backgroundBarWidth: number;
    imagePath: string;
    offsetX: number;
    offsetY: number;
    isDragging: boolean;
    private handleCanvas;
    constructor(scrollingPanel: DraggableScrollingPanel);
    initHandle(): Promise<void>;
    updateHandle(): void;
    setMoveType(moveType: "smooth" | "instant"): void;
    delete(): void;
    hide(): void;
    show(): void;
}
