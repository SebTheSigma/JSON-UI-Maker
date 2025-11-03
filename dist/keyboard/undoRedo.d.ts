export interface ElementState {
    left?: number;
    top?: number;
    width?: number;
    height?: number;
    [key: string]: any;
}
export interface UndoRedoOperation {
    type: 'add' | 'delete' | 'modify' | 'drag' | 'resize';
    elementId?: string;
    elementData?: any;
    previousState?: ElementState;
    newState?: ElementState;
}
export declare class UndoRedoManager {
    private undoStack;
    private redoStack;
    private readonly maxOperations;
    push(operation: UndoRedoOperation): void;
    undo(): void;
    redo(): void;
    private performOperation;
    private performReverseOperation;
    private restoreElement;
    private applyElementState;
    private applyLabelProperty;
    private applyGenericProperty;
    private updateUI;
    canUndo(): boolean;
    canRedo(): boolean;
    clear(): void;
    recordDragStart(elementId: string): void;
    recordDragEnd(): void;
    recordResizeStart(elementId: string): void;
    recordResizeEnd(): void;
    private statesEqual;
    private pendingDragState;
    private pendingResizeState;
}
export declare const undoRedoManager: UndoRedoManager;
