import { GLOBAL_ELEMENT_MAP, setCopiedElement } from "../index.js";
export class Copier {
    /**
     * Copies the currently selected HTML element.
     *
     * This function checks if there is a selected element and retrieves its ID.
     * If a valid ID is found, it accesses the corresponding element class from the GLOBAL_ELEMENT_MAP.
     * It then unselects the element, clones its main HTML element, and sets it as the copied element
     * using setCopiedElement. If no element is selected, the function returns early.
     *
     * @param element - The HTML element to be copied.
     */
    static copy(element) {
        console.log("Copying element...");
        const id = element.dataset.id;
        if (!id)
            return;
        const elementClass = GLOBAL_ELEMENT_MAP.get(id);
        if (elementClass?.selected)
            elementClass?.unSelect();
        setCopiedElement(elementClass?.getMainHTMLElement().cloneNode(true));
        console.log("Copied element.");
    }
}
//# sourceMappingURL=copy.js.map