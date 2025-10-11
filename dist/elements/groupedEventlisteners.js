import { draggedElement, resizedElement } from "../index.js";
let pendingEvent = null;
let ticking = false;
document.addEventListener("mousemove", (e) => {
    if (!draggedElement && !resizedElement)
        return;
    pendingEvent = e;
    if (!ticking) {
        requestAnimationFrame(() => {
            if (pendingEvent) {
                if (draggedElement)
                    draggedElement.drag(pendingEvent);
                if (resizedElement)
                    resizedElement.resize(pendingEvent);
                pendingEvent = null;
            }
            ticking = false;
        });
        ticking = true;
    }
});
document.addEventListener("mouseup", (e) => {
    if (!draggedElement && !resizedElement)
        return;
    draggedElement?.stopDrag();
    resizedElement?.stopResize(e);
});
//# sourceMappingURL=groupedEventlisteners.js.map