export declare const registeredElements: Map<string, ExplorerDrag>;
export declare class ExplorerDrag {
    id: string;
    textElement: HTMLElement | undefined;
    handleMouseDown: ((e: MouseEvent) => void) | undefined;
    handleMouseMove: ((e: MouseEvent) => void) | undefined;
    handleMouseUp: ((e: MouseEvent) => void) | undefined;
    constructor(textElement: HTMLElement);
    destroy(): void;
}
export declare function enterExplorerArea(): void;
export declare function leaveExplorerArea(): void;
