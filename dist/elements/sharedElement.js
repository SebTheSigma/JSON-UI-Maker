import { isInMainWindow, mainJsonUiPanelElement, selectedElement, setSelectedElement } from "../index.js";
import { config } from "../CONFIG.js";
import { keyboardEvent } from "../keyboard/eventListeners.js";
import { updatePropertiesArea } from "../ui/propertiesArea.js";
import { StringUtil } from "../util/stringUtil.js";
import { DraggableButton } from "./button.js";
import { DraggableCanvas } from "./canvas.js";
import { DraggableCollectionPanel } from "./collectionPanel.js";
import { DraggablePanel } from "./panel.js";
import { DraggableScrollingPanel } from "./scrollingPanel.js";
import { DraggableLabel } from "./label.js";
import { AllJsonUIElements } from "./elements.js";
import { GeneralUtil } from "../util/generalUtil.js";
import { MathUtil } from "../util/mathUtil.js";
export function isSelectableElement(el) {
    return (el instanceof DraggableButton ||
        el instanceof DraggablePanel ||
        el instanceof DraggableCanvas ||
        el instanceof DraggableCollectionPanel ||
        el instanceof DraggableScrollingPanel ||
        el instanceof DraggableLabel);
}
export function isResizeableElement(el) {
    return (el instanceof DraggableButton ||
        el instanceof DraggablePanel ||
        el instanceof DraggableCanvas ||
        el instanceof DraggableCollectionPanel ||
        el instanceof DraggableScrollingPanel);
}
export function isGridableElement(el) {
    return el instanceof DraggableButton || el instanceof DraggablePanel || el instanceof DraggableCanvas || el instanceof DraggableCollectionPanel;
}
export class ElementSharedFuncs {
    /**
     * Starts the resize process for the given element. Records the initial width, height, x, y, left, and top values of the element.
     * This is used to track changes in the element's size and position during the resize process.
     * @param e The mouse event that triggered the resize process.
     * @param classElement The element to start resizing.
     * @param stopPropagation Whether to stop the event from bubbling to the parent element.
     * @param preventDefault Whether to prevent the default action of the event. This is useful if you want to prevent the browser from selecting the element when the user clicks on it.
     */
    static startResize(e, classElement, stopPropagation = true, preventDefault = true) {
        const panel = classElement.getMainHTMLElement();
        if (stopPropagation)
            e.stopPropagation(); // Prevent event from bubbling to parent
        classElement.isResizing = true;
        classElement.resizeStartWidth = parseFloat(panel.style.width);
        classElement.resizeStartHeight = parseFloat(panel.style.height);
        classElement.resizeStartX = e.clientX;
        classElement.resizeStartY = e.clientY;
        classElement.resizeStartLeft = StringUtil.cssDimToNumber(panel.style.left);
        classElement.resizeStartTop = StringUtil.cssDimToNumber(panel.style.top);
        if (preventDefault)
            e.preventDefault();
    }
    /**
     * Handles the resize event for the given element. The element is resized according to the user's mouse movement. The element's size is updated in real time.
     * @param e The mouse event that triggered the resize process.
     * @param classElement The element to resize.
     */
    static resize(e, classElement) {
        const panel = classElement.getMainHTMLElement();
        e.stopPropagation(); // Prevent bubbling to parent
        const containerRect = classElement.container.getBoundingClientRect();
        const widthChange = e.clientX - classElement.resizeStartX;
        const heightChange = e.clientY - classElement.resizeStartY;
        let newWidth = classElement.resizeStartWidth + widthChange;
        let newHeight = classElement.resizeStartHeight + heightChange;
        let newLeft = classElement.resizeStartLeft;
        let newTop = classElement.resizeStartTop;
        let updateLeft = true;
        let updateTop = true;
        // ALT only → centered resize
        if (keyboardEvent.altKey) {
            newLeft = classElement.resizeStartLeft - widthChange;
            newTop = classElement.resizeStartTop - heightChange;
            newWidth += widthChange;
            console.log(newWidth);
            if (newWidth < 0) {
                newWidth = 0;
                updateLeft = false;
            }
            console.log(newHeight);
            newHeight += heightChange;
            if (newHeight < 0) {
                newHeight = 0;
                updateTop = false;
            }
        }
        // SHIFT only → square aspect ratio
        else if (keyboardEvent.shiftKey) {
            if (newHeight > newWidth) {
                newWidth = newHeight;
            }
            else {
                newHeight = newWidth;
            }
        }
        // Apply constraints
        if (config.settings.boundary_constraints.value) {
            panel.style.width = `${Math.max(0, Math.min(newWidth, containerRect.width - newLeft))}px`;
            panel.style.height = `${Math.max(0, Math.min(newHeight, containerRect.height - newTop))}px`;
            if (updateLeft)
                panel.style.left = `${Math.max(0, Math.min(newLeft, containerRect.width))}px`;
            if (updateTop)
                panel.style.top = `${Math.max(0, Math.min(newTop, containerRect.height))}px`;
        }
        else {
            panel.style.width = `${newWidth}px`;
            panel.style.height = `${newHeight}px`;
            if (updateLeft)
                panel.style.left = `${newLeft}px`;
            if (updateTop)
                panel.style.top = `${newTop}px`;
        }
    }
    /**
     * Stops the resize process for the given element. Also updates the properties area if the main window is active.
     * @param classElement The element to stop resizing.
     */
    static stopResize(classElement) {
        classElement.isResizing = false;
        if (isInMainWindow)
            updatePropertiesArea();
    }
    /**
     * Handles the selection of an element. If the element is already selected, it is deselected.
     * If another element is already selected, it is deselected and the given element is selected.
     * The selected element is highlighted with a blue border and updated in the properties area.
     * @param e The mouse event that triggered the selection.
     * @param classElement The element to select.
     */
    static select(e, classElement) {
        e.stopPropagation(); // Prevent the event from bubbling up to the parent
        const element = classElement.getMainHTMLElement();
        if (classElement.selected) {
            console.log("Deselecting", classElement.getMainHTMLElement().dataset.id);
            classElement.unSelect(e);
            return;
        }
        if (selectedElement) {
            if (selectedElement !== element) {
                const selectedClassElement = GeneralUtil.elementToClassElement(selectedElement);
                selectedClassElement.unSelect(e);
                classElement.selected = true;
                setSelectedElement(element);
                element.style.outline = `${config.settings.element_outline.value}px solid blue`;
                updatePropertiesArea();
                return;
            }
        }
        classElement.selected = true;
        setSelectedElement(element);
        element.style.outline = `${config.settings.element_outline.value}px solid blue`;
        updatePropertiesArea();
    }
    /**
     * Deselects the given element. The element is removed from the properties area and its outline is reset to the default color.
     * @param classElement The element to deselect.
     */
    static unSelect(classElement) {
        classElement.selected = false;
        setSelectedElement(undefined);
        const element = classElement.getMainHTMLElement();
        element.style.outline = `${config.settings.element_outline.value}px solid black`;
        updatePropertiesArea();
    }
    /**
     * Starts the drag process for the given element. Prevents the event from bubbling
     * up to the parent and sets the element's isDragging property to true. Calculates
     * the offset of the mouse from the top-left corner of the element and sets the
     * element's cursor to "grabbing".
     * @param e The mouse event that triggered the drag.
     * @param classElement The element to drag.
     */
    static startDrag(e, classElement) {
        // Stop propagation for nested elements
        for (let elementName of AllJsonUIElements) {
            if (classElement.container.classList.contains(elementName)) {
                e.stopPropagation();
            }
        }
        classElement.isDragging = true;
        const parentElement = classElement.container;
        const parentClassElement = GeneralUtil.elementToClassElement(parentElement);
        if (isGridableElement(parentClassElement) && parentElement.dataset.id !== mainJsonUiPanelElement?.dataset.id) {
            parentClassElement.grid(config.settings.show_grid.value);
        }
        const mainElement = classElement.getMainHTMLElement();
        // Get position relative to parent container
        const panelRect = mainElement.getBoundingClientRect();
        classElement.offsetX = e.clientX - panelRect.left;
        classElement.offsetY = e.clientY - panelRect.top;
        mainElement.style.cursor = "grabbing";
    }
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
    static drag(e, classElement, mainElement) {
        e.stopPropagation();
        if (!classElement.isDragging)
            return;
        if (isResizeableElement(classElement)) {
            if (classElement.isResizing)
                return;
        }
        const c = classElement.centerCircle;
        console.log('dragging', c?.getBoundingClientRect(), c?.style.display);
        if (!mainElement)
            mainElement = classElement.getMainHTMLElement();
        const gridWidth = config.settings.grid_lock_columns.value;
        const gridHeight = config.settings.grid_lock_rows.value;
        const radius = config.settings.grid_lock_radius.value;
        const containerRect = classElement.container.getBoundingClientRect();
        const rect = mainElement.getBoundingClientRect();
        // Calculate desired position
        let newLeft = e.clientX - containerRect.left - classElement.offsetX;
        let newTop = e.clientY - containerRect.top - classElement.offsetY;
        if (config.settings.grid_lock.value) {
            const gridCellWidth = containerRect.width / gridWidth;
            const gridCellHeight = containerRect.height / gridHeight;
            const centerPoint = [newLeft + rect.width / 2, newTop + rect.height / 2];
            // ---- Closest point snapping ----
            const nearestGridX = Math.round(centerPoint[0] / gridCellWidth) * gridCellWidth;
            const nearestGridY = Math.round(centerPoint[1] / gridCellHeight) * gridCellHeight;
            const closestPoint = [nearestGridX, nearestGridY];
            const distanceToPoint = MathUtil.getDistanceVector2(centerPoint, closestPoint);
            if (distanceToPoint < radius) {
                newLeft = closestPoint[0] - rect.width / 2 - 1;
                newTop = closestPoint[1] - rect.height / 2 - 1;
            }
            else {
                // ---- Closest vertical line (X) ----
                const nearestLineX = Math.round(centerPoint[0] / gridCellWidth) * gridCellWidth;
                const distanceX = Math.abs(centerPoint[0] - nearestLineX);
                if (distanceX < radius) {
                    newLeft = nearestLineX - rect.width / 2 - 1;
                }
                // ---- Closest horizontal line (Y) ----
                const nearestLineY = Math.round(centerPoint[1] / gridCellHeight) * gridCellHeight;
                const distanceY = Math.abs(centerPoint[1] - nearestLineY);
                if (distanceY < radius) {
                    newTop = nearestLineY - rect.height / 2 - 1;
                }
            }
        }
        if (config.settings.boundary_constraints.value) {
            // Constrain to container bounds
            newLeft = Math.max(0, Math.min(newLeft, containerRect.width - mainElement.offsetWidth));
            newTop = Math.max(0, Math.min(newTop, containerRect.height - mainElement.offsetHeight));
        }
        mainElement.style.left = `${newLeft}px`;
        mainElement.style.top = `${newTop}px`;
    }
    static generateCenterPoint() {
        const circle = document.createElement("div");
        circle.classList.add("center-point");
        circle.style.width = `10px`;
        circle.style.height = `10px`;
        circle.style.position = "absolute";
        circle.style.borderRadius = "50%";
        circle.style.backgroundColor = "blue";
        circle.style.display = "none";
        return circle;
    }
    /**
     * Updates the position of the center point circle of the given element. The circle is
     * positioned in the center of the element's panel.
     * @param classElement The element for which to update the center point circle.
     */
    static updateCenterCirclePosition(classElement) {
        const rect = classElement.getMainHTMLElement().getBoundingClientRect();
        const centerRect = [
            StringUtil.cssDimToNumber(classElement.centerCircle.style.width),
            StringUtil.cssDimToNumber(classElement.centerCircle.style.height),
        ];
        console.log("centerRect", centerRect, rect);
        classElement.centerCircle.style.left = `${(rect.width - centerRect[0]) / 2 - 1}px`;
        classElement.centerCircle.style.top = `${(rect.height - centerRect[1]) / 2 - 1}px`;
    }
    /**
     * Stops the drag process for the given element. The element's isDragging
     * property is set to false and its cursor is reset to "grab". If the element
     * is in the main window, the properties area is updated.
     * @param classElement The element to stop dragging.
     */
    static stopDrag(classElement) {
        classElement.isDragging = false;
        classElement.getMainHTMLElement().style.cursor = "grab";
        if (isInMainWindow)
            updatePropertiesArea();
        const parentElement = classElement.container;
        const parentClassElement = GeneralUtil.elementToClassElement(parentElement);
        if (isGridableElement(parentClassElement) && parentElement.dataset.id !== mainJsonUiPanelElement?.dataset.id)
            parentClassElement.grid(false);
    }
    /**
     * Generates a new grid element. A grid element is a special element which
     * is used to create the grid in the main window. It is marked with the
     * class "gridable" and has a property "skip" that is set to "true". This
     * method is used by classes that implement the GridableElements interface
     * to create the grid element which is used to position the element.
     * @returns The newly created grid element.
     */
    static generateGridElement() {
        const gridElement = document.createElement("div");
        gridElement.classList.add("gridable");
        gridElement.dataset.skip = "true";
        return gridElement;
    }
    static grid(showGrid, classElement) {
        console.log("showGrid", showGrid);
        if (!showGrid) {
            classElement.gridElement.style.removeProperty("--grid-cols");
            classElement.gridElement.style.removeProperty("--grid-rows");
        }
        else {
            classElement.gridElement.style.setProperty("--grid-cols", String(config.settings.grid_lock_columns.value));
            classElement.gridElement.style.setProperty("--grid-rows", String(config.settings.grid_lock_rows.value));
        }
    }
}
//# sourceMappingURL=sharedElement.js.map