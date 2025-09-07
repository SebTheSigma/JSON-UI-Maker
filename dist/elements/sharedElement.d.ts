import { GlobalElementMapValue } from "../index.js";
import { DraggableButton } from "./button.js";
import { DraggableCanvas } from "./canvas.js";
import { DraggableCollectionPanel } from "./collectionPanel.js";
import { DraggablePanel } from "./panel.js";
import { DraggableScrollingPanel } from "./scrollingPanel.js";
import { DraggableLabel } from "./label.js";
export type SelectableElements = DraggableButton | DraggablePanel | DraggableCanvas | DraggableCollectionPanel | DraggableScrollingPanel | DraggableLabel;
export declare function isSelectableElement(el: unknown): el is SelectableElements;
export type ResizeableElements = DraggableButton | DraggablePanel | DraggableCanvas | DraggableCollectionPanel | DraggableScrollingPanel;
export declare function isResizeableElement(el: unknown): el is ResizeableElements;
export type GridableElements = DraggableButton | DraggablePanel | DraggableCanvas | DraggableCollectionPanel;
export declare function isGridableElement(el: unknown): el is GridableElements;
export declare class ElementSharedFuncs {
    /**
     * Starts the resize process for the given element. Records the initial width, height, x, y, left, and top values of the element.
     * This is used to track changes in the element's size and position during the resize process.
     * @param e The mouse event that triggered the resize process.
     * @param classElement The element to start resizing.
     * @param stopPropagation Whether to stop the event from bubbling to the parent element.
     * @param preventDefault Whether to prevent the default action of the event. This is useful if you want to prevent the browser from selecting the element when the user clicks on it.
     */
    static startResize(e: MouseEvent, classElement: ResizeableElements, stopPropagation?: boolean, preventDefault?: boolean): void;
    /**
     * Handles the resize event for the given element. The element is resized according to the user's mouse movement. The element's size is updated in real time.
     * @param e The mouse event that triggered the resize process.
     * @param classElement The element to resize.
     */
    static resize(e: MouseEvent, classElement: ResizeableElements): void;
    /**
     * Stops the resize process for the given element. Also updates the properties area if the main window is active.
     * @param classElement The element to stop resizing.
     */
    static stopResize(classElement: ResizeableElements): void;
    /**
     * Handles the selection of an element. If the element is already selected, it is deselected.
     * If another element is already selected, it is deselected and the given element is selected.
     * The selected element is highlighted with a blue border and updated in the properties area.
     * @param e The mouse event that triggered the selection.
     * @param classElement The element to select.
     */
    static select(e: MouseEvent, classElement: SelectableElements): void;
    /**
     * Deselects the given element. The element is removed from the properties area and its outline is reset to the default color.
     * @param classElement The element to deselect.
     */
    static unSelect(classElement: SelectableElements): void;
    /**
     * Starts the drag process for the given element. Prevents the event from bubbling
     * up to the parent and sets the element's isDragging property to true. Calculates
     * the offset of the mouse from the top-left corner of the element and sets the
     * element's cursor to "grabbing".
     * @param e The mouse event that triggered the drag.
     * @param classElement The element to drag.
     */
    static startDrag(e: MouseEvent, classElement: GlobalElementMapValue): void;
    /**
     * Handles the dragging of an element. The element is moved to the desired
     * position based on the given mouse event. If the element is resizeable, it
     * is not moved. The element is also constrained to the bounds of its
     * container if the boundary_constraints setting is enabled.
     * @param e The mouse event that triggered the drag.
     * @param classElement The element to drag.
     * @param mainElement The main HTMLElement of the element to drag. If not
     * provided, the main HTMLElement of classElement is used.
     */
    static drag(e: MouseEvent, classElement: GlobalElementMapValue, mainElement?: HTMLElement): void;
    static generateCenterPoint(): HTMLElement;
    /**
     * Updates the position of the center point circle of the given element. The circle is
     * positioned in the center of the element's panel.
     * @param classElement The element for which to update the center point circle.
     */
    static updateCenterCirclePosition(classElement: GridableElements): void;
    /**
     * Stops the drag process for the given element. The element's isDragging
     * property is set to false and its cursor is reset to "grab". If the element
     * is in the main window, the properties area is updated.
     * @param classElement The element to stop dragging.
     */
    static stopDrag(classElement: GlobalElementMapValue): void;
    /**
     * Generates a new grid element. A grid element is a special element which
     * is used to create the grid in the main window. It is marked with the
     * class "gridable" and has a property "skip" that is set to "true". This
     * method is used by classes that implement the GridableElements interface
     * to create the grid element which is used to position the element.
     * @returns The newly created grid element.
     */
    static generateGridElement(): HTMLElement;
    static grid(showGrid: boolean, classElement: GridableElements): void;
}
