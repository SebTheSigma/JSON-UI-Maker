import { DraggableButton } from "../elements/button.js";
import { DraggablePanel } from "../elements/panel.js";
import { GLOBAL_ELEMENT_MAP, selectedElement } from "../index.js";
import { propertiesMap } from "../ui/propertiesArea.js";
import { StringUtil } from "../util/stringUtil.js";
const elementToDuplicateClass = new Map([
    [
        "draggable-button",
        (copiedElement) => {
            const oldId = copiedElement?.dataset?.id;
            if (!oldId)
                return;
            const classElement = GLOBAL_ELEMENT_MAP.get(oldId);
            if (!classElement)
                return;
            console.warn(`Duping button constructor args: ${JSON.stringify(classElement._constructorArgs)}`);
            const id = StringUtil.generateRandomString(15);
            const button = new DraggableButton(id, selectedElement, classElement._constructorArgs[2]);
            const properties = propertiesMap.get(classElement.getMainHTMLElement().className);
            for (let property of properties) {
                const value = property.get(classElement.getMainHTMLElement());
                property.set(button.getMainHTMLElement(), value);
            }
            GLOBAL_ELEMENT_MAP.set(id, button);
            return button;
        }
    ],
    [
        "draggable-panel",
        (copiedElement) => {
            const oldId = copiedElement?.dataset?.id;
            if (!oldId)
                return;
            const classElement = GLOBAL_ELEMENT_MAP.get(oldId);
            if (!classElement)
                return;
            console.warn(`Duping panel constructor args: ${JSON.stringify(classElement._constructorArgs)}`);
            const id = StringUtil.generateRandomString(15);
            const panel = new DraggablePanel(id, selectedElement);
            const properties = propertiesMap.get(classElement.getMainHTMLElement().className);
            for (let property of properties) {
                const value = property.get(classElement.getMainHTMLElement());
                property.set(panel.getMainHTMLElement(), value);
            }
            GLOBAL_ELEMENT_MAP.set(id, panel);
            return panel;
        }
    ]
]);
export class Paster {
    static paste(parent, copiedElement) {
        console.log("Pasting element...");
        const dupeFunc = elementToDuplicateClass.get(copiedElement.className);
        if (!dupeFunc)
            return;
        const dupe = dupeFunc(copiedElement);
    }
    /**
     * Creates a duplicate of a given class instance.
     *
     * This function uses the constructor of the provided instance to create a new
     * instance of the same class. It then copies all properties from the original
     * instance to the new instance using `Object.assign`.
     *
     * @param instance - The class instance to duplicate.
     * @returns A new instance of the same class with copied properties.
     */
    static duplicateClassInstance(instance) {
        const args = instance._constructorArgs ?? [];
        const ctor = instance.constructor;
        const copy = new ctor(...args);
        Object.assign(copy, instance); // Copy properties (optional)
        return copy;
    }
}
//# sourceMappingURL=paste.js.map