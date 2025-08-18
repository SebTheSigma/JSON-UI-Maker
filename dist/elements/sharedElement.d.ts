import { DraggableButton } from "./button.js";
import { DraggableCanvas } from "./canvas.js";
import { DraggableCollectionPanel } from "./collectionPanel.js";
import { DraggablePanel } from "./panel.js";
import { DraggableScrollingPanel } from "./scrollingPanel.js";
import { DraggableLabel } from "./label.js";
type selectableElements = DraggableButton | DraggablePanel | DraggableCanvas | DraggableCollectionPanel | DraggableScrollingPanel | DraggableLabel;
type resizeableElements = DraggableButton | DraggablePanel | DraggableCanvas | DraggableCollectionPanel | DraggableScrollingPanel;
export declare class ElementSharedFuncs {
    static startResize(e: MouseEvent, classElement: resizeableElements, stopPropagation?: boolean, preventDefault?: boolean): void;
    static resize(e: MouseEvent, classElement: resizeableElements): void;
    static stopResize(classElement: resizeableElements): void;
    static select(e: MouseEvent, classElement: selectableElements): void;
    static unSelect(classElement: selectableElements): void;
}
export {};
