import { DraggableScrollingPanel } from "../../elements/scrollingPanel.js";
export declare class MinecraftSlider {
    backgroundBar: HTMLElement;
    scrollingPanel: DraggableScrollingPanel;
    scrollBarWidth: number;
    offsetX: number;
    offsetY: number;
    isDragging: boolean;
    private handleCanvas;
    private handleNinesliceInfo;
    constructor(scrollingPanel: DraggableScrollingPanel);
    initHandle(): Promise<void>;
    updateHandle(): void;
    startManualBarScroll(e: MouseEvent): void;
    manualBarScroll(e: MouseEvent): void;
    stopManualBarScroll(): void;
    setMoveType(moveType: 'smooth' | 'instant'): void;
}
