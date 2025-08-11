import { GlobalElementMapValue, GLOBAL_ELEMENT_MAP } from "../index.js";

export class GeneralUtil {
    public static elementToClassElement(element: HTMLElement): GlobalElementMapValue | undefined {
        const id = element.dataset.id!;
        if (!id) return undefined;

        return GLOBAL_ELEMENT_MAP.get(id);
    }
}