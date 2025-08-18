import { isInMainWindow } from "../index.js";
import { config } from "../CONFIG.js";
import { keyboardEvent } from "../keyboard/eventListeners.js";
import { updatePropertiesArea } from "../ui/propertiesArea.js";
import { StringUtil } from "../util/stringUtil.js";
import { DraggableButton } from "./button.js";
import { DraggableCanvas } from "./canvas.js";
import { DraggableCollectionPanel } from "./collectionPanel.js";
import { DraggablePanel } from "./panel.js";
import { DraggableScrollingPanel } from "./scrollingPanel.js";

export class ElementSharedFuncs {
    public static startResize(
        e: MouseEvent,
        classElement: DraggableButton | DraggablePanel | DraggableCanvas | DraggableCollectionPanel | DraggableScrollingPanel,
        stopPropagation: boolean = true,
        preventDefault: boolean = true
    ): void {
        const panel = classElement.getMainHTMLElement();

        if (stopPropagation) e.stopPropagation(); // Prevent event from bubbling to parent
        classElement.isResizing = true;
        classElement.resizeStartWidth = parseFloat(panel.style.width);
        classElement.resizeStartHeight = parseFloat(panel.style.height);
        classElement.resizeStartX = e.clientX;
        classElement.resizeStartY = e.clientY;
        classElement.resizeStartLeft = StringUtil.cssDimToNumber(panel.style.left);
        classElement.resizeStartTop = StringUtil.cssDimToNumber(panel.style.top);

        if (preventDefault) e.preventDefault();
    }

    public static resize(
        e: MouseEvent,
        classElement: DraggableButton | DraggablePanel | DraggableCanvas | DraggableCollectionPanel | DraggableScrollingPanel
    ): void {
        const panel = classElement.getMainHTMLElement();

        if (!classElement.isResizing) return;
        e.stopPropagation(); // Prevent bubbling to parent

        const containerRect: DOMRect = classElement.container.getBoundingClientRect();

        const widthChange: number = e.clientX - classElement.resizeStartX!;
        const heightChange: number = e.clientY - classElement.resizeStartY!;
        let newWidth: number = classElement.resizeStartWidth! + widthChange;
        let newHeight: number = classElement.resizeStartHeight! + heightChange;

        let newLeft: number = classElement.resizeStartLeft!;
        let newTop: number = classElement.resizeStartTop!;

        let updateLeft: boolean = true;
        let updateTop: boolean = true;

        // ALT only → centered resize
        if (keyboardEvent.altKey) {
            newLeft = classElement.resizeStartLeft! - widthChange;
            newTop = classElement.resizeStartTop! - heightChange;

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
            } else {
                newHeight = newWidth;
            }
        }

        // Apply constraints
        if (config.settings.boundary_constraints!.value) {
            panel.style.width = `${Math.max(0, Math.min(newWidth, containerRect.width - newLeft))}px`;
            panel.style.height = `${Math.max(0, Math.min(newHeight, containerRect.height - newTop))}px`;

            if (updateLeft) panel.style.left = `${Math.max(0, Math.min(newLeft, containerRect.width))}px`;
            if (updateTop) panel.style.top = `${Math.max(0, Math.min(newTop, containerRect.height))}px`;
        } else {
            panel.style.width = `${newWidth}px`;
            panel.style.height = `${newHeight}px`;

            if (updateLeft) panel.style.left = `${newLeft}px`;
            if (updateTop) panel.style.top = `${newTop}px`;
        }
    }

    public static stopResize(classElement: DraggableButton | DraggablePanel | DraggableCanvas | DraggableCollectionPanel | DraggableScrollingPanel): void {
        classElement.isResizing = false;
        if (isInMainWindow) updatePropertiesArea();
    }
}
