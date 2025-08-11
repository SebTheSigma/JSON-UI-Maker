import { GLOBAL_ELEMENT_MAP } from "../index.js";
export class GeneralUtil {
    static elementToClassElement(element) {
        const id = element.dataset.id;
        if (!id)
            return undefined;
        return GLOBAL_ELEMENT_MAP.get(id);
    }
}
//# sourceMappingURL=generalUtil.js.map