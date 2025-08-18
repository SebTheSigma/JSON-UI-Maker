import { isInMainWindow } from "../index.js";
import { config } from "../CONFIG.js";
import { keyboardEvent } from "../keyboard/eventListeners.js";
import { updatePropertiesArea } from "../ui/propertiesArea.js";
import { StringUtil } from "../util/stringUtil.js";
export class ElementSharedFuncs {
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
    static resize(e, classElement) {
        const panel = classElement.getMainHTMLElement();
        if (!classElement.isResizing)
            return;
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
    static stopResize(classElement) {
        classElement.isResizing = false;
        if (isInMainWindow)
            updatePropertiesArea();
    }
}
//# sourceMappingURL=sharedElement.js.map