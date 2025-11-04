import { DraggableLabel } from "../elements/label.js";
import { GLOBAL_ELEMENT_MAP, Builder } from "../index.js";
import { Notification } from "../ui/notifs/noficationMaker.js";
import { StringUtil } from "../util/stringUtil.js";

export interface ElementState {
    left?: number;
    top?: number;
    width?: number;
    height?: number;
    [key: string]: any; // Allow additional properties for different element types
}

export interface UndoRedoOperation {
    type: 'add' | 'delete' | 'modify' | 'drag' | 'resize';
    elementId?: string;
    elementData?: any;
    previousState?: ElementState;
    newState?: ElementState;
}

export class UndoRedoManager {
    private undoStack: UndoRedoOperation[] = [];
    private redoStack: UndoRedoOperation[] = [];
    private readonly maxOperations = 50;

    public push(operation: UndoRedoOperation): void {
        this.undoStack.push(operation);
        this.redoStack = []; // Clear redo stack when new operation is performed

        // Maintain maximum depth
        if (this.undoStack.length > this.maxOperations) {
            this.undoStack.shift();
        }

        this.updateUI();
    }

    public undo(): void {
        console.log(this.undoStack, this.redoStack);
        const operation = this.undoStack.pop();
        if (!operation) {
            new Notification("No operations to undo", 2000, "warning");
            return;
        }

        this.redoStack.unshift(operation); // Add to beginning of redo stack
        this.performReverseOperation(operation);
        this.updateUI();

        new Notification("Undid last change", 2000, "notif");
    }

    public redo(): void {
        console.log(this.undoStack, this.redoStack);
        const operation = this.redoStack.shift(); // Take from beginning of redo stack
        if (!operation) {
            new Notification("No operations to redo", 2000, "warning");
            return;
        }

        this.undoStack.push(operation);
        this.performOperation(operation);
        this.updateUI();

        new Notification("Redid last change", 2000, "notif");
    }

    private performOperation(operation: UndoRedoOperation): void {
        switch (operation.type) {
            case 'add':
                // Recreate the element from data
                if (operation.elementData) {
                    this.restoreElement(operation.elementData);
                }
                break;
            case 'delete':
                // Delete the element (when redoing a delete)
                if (operation.elementId) {
                    Builder.delete(operation.elementId);
                }
                break;
            case 'modify':
            case 'drag':
            case 'resize':
                // Apply the new state
                if (operation.elementId && operation.newState) {
                    this.applyElementState(operation.elementId, operation.newState);
                }
                break;
        }
    }

    private performReverseOperation(operation: UndoRedoOperation): void {
        switch (operation.type) {
            case 'add':
                // Remove the added element (when undoing an add)
                if (operation.elementId) {
                    // Directly delete without recording a new undo operation
                    const element = GLOBAL_ELEMENT_MAP.get(operation.elementId);
                    if (element && element.deleteable) {
                        element.delete();
                        GLOBAL_ELEMENT_MAP.delete(operation.elementId);
                        Builder.updateExplorer();
                        import("../ui/propertiesArea.js").then(module => module.updatePropertiesArea());
                    }
                }
                break;
            case 'delete':
                // Restore the deleted element (when undoing a delete)
                if (operation.elementData) {
                    this.restoreElement(operation.elementData);
                }
                break;
            case 'modify':
            case 'drag':
            case 'resize':
                // Revert to previous state
                if (operation.elementId && operation.previousState) {
                    this.applyElementState(operation.elementId, operation.previousState);
                }
                break;
        }
    }

    private restoreElement(elementData: any): void {
        const elementType = elementData.type.replace('draggable-', ''); // Remove 'draggable-' prefix

        switch (elementType) {
            case 'label':
                Builder.addLabel();
                break;
            case 'panel':
                Builder.addPanel();
                break;
            case 'collection_panel':
                Builder.addCollectionPanel();
                break;
            case 'scrolling_panel':
                Builder.addScrollingPanel();
                break;
            case 'canvas':
                // Would need image data - for now skip
                break;
            case 'button':
                // Would need texture data - for now skip
                break;
            default:
                console.warn('Unknown element type for restoration:', elementType);
        }
    }

    private applyElementState(elementId: string, state: ElementState): void {
        const element = GLOBAL_ELEMENT_MAP.get(elementId);
        if (!element) return;

        const mainElement = element.getMainHTMLElement();

        // Apply position and size
        if (state.left !== undefined) mainElement.style.left = `${state.left}px`;
        if (state.top !== undefined) mainElement.style.top = `${state.top}px`;
        if (state.width !== undefined) mainElement.style.width = `${state.width}px`;
        if (state.height !== undefined) mainElement.style.height = `${state.height}px`;

        // Handle other property types - these are stored as snake_case keys
        for (const key in state) {
            console.warn(key);
            if (key === 'left' || key === 'top' || key === 'width' || key === 'height') continue;

            const value = state[key];
            const displayName = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

            // Handle different property types based on the element
            if (mainElement.classList.contains('draggable-label')) {
                this.applyLabelProperty(mainElement, key, value);
            } else {
                // For other elements, try to set as style or attribute
                this.applyGenericProperty(mainElement, key, value);
            }
        }

        Builder.updateExplorer();

        // Update properties area to reflect changes
        import("../ui/propertiesArea.js").then(module => module.updatePropertiesArea());
    }

    private applyLabelProperty(labelElement: HTMLElement, propertyKey: string, value: any): void {
        const labelClass = GLOBAL_ELEMENT_MAP.get(labelElement.dataset.id!) as DraggableLabel;
        if (!labelClass || !labelClass.label) return;

        const label = labelClass.label;
        const mirror = labelClass.mirror;
        const shadowLabel = labelClass.shadowLabel;

        console.log(propertyKey, value);

        switch (propertyKey) {
            case 'text':
                label.value = value;
                mirror.textContent = value;
                shadowLabel.textContent = value;
                labelClass.updateSize(false);
                break;
            case 'font_scale':
                label.style.fontSize = `${value}em`;
                mirror.style.fontSize = `${value}em`;
                shadowLabel.style.fontSize = `${value}em`;
                labelClass.lastAttemptedScaleFactor = value;
                labelClass.updateSize(false);
                break;
            case 'text_align':
                label.style.textAlign = value;
                mirror.style.textAlign = value;
                shadowLabel.style.textAlign = value;
                labelClass.updateSize(false);
                break;
            case 'font_family':
                label.style.fontFamily = value;
                mirror.style.fontFamily = value;
                shadowLabel.style.fontFamily = value;
                labelClass.updateSize(false);
                break;
            case 'shadow':
                labelClass.shadow(!labelClass.hasShadow);
                labelClass.updateSize(false);

                break;
        }
    }

    private applyGenericProperty(element: HTMLElement, propertyKey: string, value: any): void {
        // Try common property mappings
        switch (propertyKey) {
            case 'layer':
                element.style.zIndex = value;
                break;
            case 'collection_name':
                element.dataset.collectionName = value;
                break;
            case 'default_texture':
                element.dataset.defaultImagePath = value;
                break;
            case 'hover_texture':
                element.dataset.hoverImagePath = value;
                break;
            case 'pressed_texture':
                element.dataset.pressedImagePath = value;
                break;
            case 'display_texture':
                element.dataset.displayImagePath = value;
                break;
            case 'texture':
                element.dataset.imagePath = value;
                break;
            case 'collection_index':
                element.dataset.collectionIndex = value;
                break;
        }
    }

    private updateUI(): void {
        // Update undo/redo button states
        const undoBtn = document.getElementById('undo-btn') as HTMLButtonElement;
        const redoBtn = document.getElementById('redo-btn') as HTMLButtonElement;

        if (undoBtn) {
            undoBtn.disabled = this.undoStack.length === 0;
            undoBtn.title = this.undoStack.length > 0 ? `Undo (Ctrl+Z) - ${this.undoStack.length} changes` : 'Undo (Ctrl+Z)';
        }

        if (redoBtn) {
            redoBtn.disabled = this.redoStack.length === 0;
            redoBtn.title = this.redoStack.length > 0 ? `Redo (Ctrl+Y) - ${this.redoStack.length} changes` : 'Redo (Ctrl+Y)';
        }
    }

    public canUndo(): boolean {
        return this.undoStack.length > 0;
    }

    public canRedo(): boolean {
        return this.redoStack.length > 0;
    }

    public clear(): void {
        this.undoStack = [];
        this.redoStack = [];
        this.updateUI();
    }

    public recordDragStart(elementId: string): void {
        const element = GLOBAL_ELEMENT_MAP.get(elementId);
        if (!element) return;

        const mainElement = element.getMainHTMLElement();
        this.pendingDragState = {
            elementId,
            initialState: {
                left: StringUtil.cssDimToNumber(mainElement.style.left),
                top: StringUtil.cssDimToNumber(mainElement.style.top),
                width: StringUtil.cssDimToNumber(mainElement.style.width),
                height: StringUtil.cssDimToNumber(mainElement.style.height)
            }
        };
    }

    public recordDragEnd(): void {
        if (!this.pendingDragState) return;

        const element = GLOBAL_ELEMENT_MAP.get(this.pendingDragState.elementId);
        if (!element) {
            this.pendingDragState = null;
            return;
        }

        const mainElement = element.getMainHTMLElement();
        const finalState = {
            left: StringUtil.cssDimToNumber(mainElement.style.left),
            top: StringUtil.cssDimToNumber(mainElement.style.top),
            width: StringUtil.cssDimToNumber(mainElement.style.width),
            height: StringUtil.cssDimToNumber(mainElement.style.height)
        };

        // Only record if the position actually changed
        if (this.statesEqual(this.pendingDragState.initialState, finalState)) {
            this.pendingDragState = null;
            return;
        }

        this.push({
            type: 'drag',
            elementId: this.pendingDragState.elementId,
            previousState: this.pendingDragState.initialState,
            newState: finalState
        });

        this.pendingDragState = null;
    }

    public recordResizeStart(elementId: string): void {
        const element = GLOBAL_ELEMENT_MAP.get(elementId);
        if (!element) return;

        const mainElement = element.getMainHTMLElement();
        this.pendingResizeState = {
            elementId,
            initialState: {
                left: StringUtil.cssDimToNumber(mainElement.style.left),
                top: StringUtil.cssDimToNumber(mainElement.style.top),
                width: StringUtil.cssDimToNumber(mainElement.style.width),
                height: StringUtil.cssDimToNumber(mainElement.style.height)
            }
        };
    }

    public recordResizeEnd(): void {
        if (!this.pendingResizeState) return;

        const element = GLOBAL_ELEMENT_MAP.get(this.pendingResizeState.elementId);
        if (!element) {
            this.pendingResizeState = null;
            return;
        }

        const mainElement = element.getMainHTMLElement();
        const finalState = {
            left: StringUtil.cssDimToNumber(mainElement.style.left),
            top: StringUtil.cssDimToNumber(mainElement.style.top),
            width: StringUtil.cssDimToNumber(mainElement.style.width),
            height: StringUtil.cssDimToNumber(mainElement.style.height)
        };

        // Only record if the size/position actually changed
        if (this.statesEqual(this.pendingResizeState.initialState, finalState)) {
            this.pendingResizeState = null;
            return;
        }

        this.push({
            type: 'resize',
            elementId: this.pendingResizeState.elementId,
            previousState: this.pendingResizeState.initialState,
            newState: finalState
        });

        this.pendingResizeState = null;
    }

    private statesEqual(state1: ElementState, state2: ElementState): boolean {
        return state1.left === state2.left &&
               state1.top === state2.top &&
               state1.width === state2.width &&
               state1.height === state2.height;
    }

    private pendingDragState: { elementId: string; initialState: ElementState } | null = null;
    private pendingResizeState: { elementId: string; initialState: ElementState } | null = null;
}

export const undoRedoManager = new UndoRedoManager();