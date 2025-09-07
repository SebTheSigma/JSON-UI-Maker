import { GLOBAL_ELEMENT_MAP, selectedElement } from "./index.js";
import { GeneralUtil } from "./util/generalUtil.js";
import { isGridableElement } from "./elements/sharedElement.js";
export const config = {
    settings: {
        boundary_constraints: {
            type: "checkbox",
            editable: true,
            value: false,
            displayName: "Boundary Constraints",
        },
        arrow_key_move_amount: {
            type: "number",
            editable: true,
            value: 10,
            displayName: "Arrow Key Move Amount",
        },
        grid_lock_rows: {
            type: "number",
            editable: true,
            value: 2,
            displayName: "Grid Lock Rows",
            onchange: (value) => {
                if (!selectedElement)
                    return;
                const selectedElementClass = GeneralUtil.elementToClassElement(selectedElement);
                if (!isGridableElement(selectedElementClass))
                    return;
                if (selectedElementClass)
                    selectedElementClass.grid(config.settings.show_grid.value);
            }
        },
        grid_lock_columns: {
            type: "number",
            editable: true,
            value: 2,
            displayName: "Grid Lock Columns",
            onchange: (value) => {
                if (!selectedElement)
                    return;
                const selectedElementClass = GeneralUtil.elementToClassElement(selectedElement);
                if (!isGridableElement(selectedElementClass))
                    return;
                if (selectedElementClass)
                    selectedElementClass.grid(config.settings.show_grid.value);
            }
        },
        grid_lock_radius: {
            type: "number",
            editable: true,
            value: 10,
            displayName: "Grid Lock Radius"
        },
        grid_lock: {
            type: "checkbox",
            editable: true,
            value: false,
            displayName: "Grid Lock",
            onchange: (value) => {
                if (!selectedElement)
                    return;
                const selectedElementClass = GeneralUtil.elementToClassElement(selectedElement);
                if (!isGridableElement(selectedElementClass))
                    return;
                if (selectedElementClass)
                    selectedElementClass.grid(config.settings.show_grid.value);
            }
        },
        show_grid: {
            type: "checkbox",
            editable: true,
            value: false,
            displayName: "Show Grid",
            onchange: (value) => {
                if (!selectedElement)
                    return;
                const selectedElementClass = GeneralUtil.elementToClassElement(selectedElement);
                if (!isGridableElement(selectedElementClass))
                    return;
                if (selectedElementClass)
                    selectedElementClass.grid(value);
            }
        },
        element_outline: {
            type: "number",
            editable: true,
            value: 2,
            displayName: "Element Outline",
            onchange: (value) => {
                const elements = Array.from(GLOBAL_ELEMENT_MAP.values());
                for (const element of elements) {
                    const getMainHTMLElement = element.getMainHTMLElement();
                    getMainHTMLElement.style.outlineWidth = `${value}px`;
                    getMainHTMLElement.style.borderWidth = `${value}px`;
                }
            }
        }
    },
    magicNumbers: {
        textEditor: {
            indentation: 4
        },
        resizeHandleSize: 15,
        fontScalar: 1.6,
        fontOffsetX: 6,
        fontOffsetY: 6,
        getFontScaledOffsetY: (fontSize) => 2 * fontSize - 2,
        UI_SCALAR: 0.5,
        buttonImageOffsetX: 2,
        buttonImageOffsetY: 2,
        labelToOffset: (label) => {
            const fontToScalingFuncMap = new Map([
                ['MinecraftRegular', (element) => {
                        const fontSize = parseFloat(element.style.fontSize ?? '1');
                        let offsetX = fontSize * 1.5;
                        let offsetY = offsetX;
                        if (element.style.textAlign == 'center') {
                            offsetX -= 5;
                        }
                        else if (element.style.textAlign == 'right') {
                            offsetX -= 10;
                        }
                        return [offsetX, offsetY];
                    }],
                ['MinecraftTen', (element) => {
                        const fontSize = parseFloat(element.style.fontSize ?? '1');
                        let offsetX = fontSize * 2.5;
                        let offsetY = offsetX;
                        if (element.style.textAlign == 'center') {
                            offsetX -= 5;
                        }
                        else if (element.style.textAlign == 'right') {
                            offsetX -= 10;
                        }
                        return [offsetX, offsetY];
                    }],
            ]);
            const func = fontToScalingFuncMap.get(label.style.fontFamily ?? 'MinecraftRegular');
            if (!func)
                throw new Error(`Font fontSizeToOffset function not found for ${label.style.fontFamily ?? 'MinecraftRegular'}`);
            const offset = func(label);
            return offset;
        },
    },
    nameSpace: 'default_namespace',
    title: 'default_title',
    defaultCollectionName: 'form_buttons'
};
//# sourceMappingURL=CONFIG.js.map