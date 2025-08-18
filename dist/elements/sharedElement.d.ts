import { DraggableButton } from "./button.js";
import { DraggableCanvas } from "./canvas.js";
import { DraggableCollectionPanel } from "./collectionPanel.js";
import { DraggablePanel } from "./panel.js";
import { DraggableScrollingPanel } from "./scrollingPanel.js";
export declare class ElementSharedFuncs {
    static startResize(e: MouseEvent, classElement: DraggableButton | DraggablePanel | DraggableCanvas | DraggableCollectionPanel | DraggableScrollingPanel, stopPropagation?: boolean, preventDefault?: boolean): void;
    static resize(e: MouseEvent, classElement: DraggableButton | DraggablePanel | DraggableCanvas | DraggableCollectionPanel | DraggableScrollingPanel): void;
    static stopResize(classElement: DraggableButton | DraggablePanel | DraggableCanvas | DraggableCollectionPanel | DraggableScrollingPanel): void;
}
