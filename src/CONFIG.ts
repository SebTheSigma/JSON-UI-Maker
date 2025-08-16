import { selectedElement } from "./index.js";
import { GeneralUtil } from "./util/generalUtil.js";


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

            onchange: (value: number) => {
                if (!selectedElement) return;
                const selectedElementClass = GeneralUtil.elementToClassElement(selectedElement);

                if (selectedElementClass) selectedElementClass.grid(config.settings.show_grid.value);
            }
        },
        grid_lock_columns: {
            type: "number",
            editable: true,
            value: 2,
            displayName: "Grid Lock Columns",

            onchange: (value: number) => {
                if (!selectedElement) return;
                const selectedElementClass = GeneralUtil.elementToClassElement(selectedElement);

                if (selectedElementClass) selectedElementClass.grid(config.settings.show_grid.value);
            }
        },
        grid_lock: {
            type: "checkbox",
            editable: true,
            value: false,
            displayName: "Grid Lock",

            onchange: (value: boolean) => {
                if (!selectedElement) return;
                const selectedElementClass = GeneralUtil.elementToClassElement(selectedElement);

                if (selectedElementClass) selectedElementClass.grid(config.settings.show_grid.value);
            }
        },
        show_grid: {
            type: "checkbox",
            editable: true,
            value: false,
            displayName: "Show Grid",

            onchange: (value: boolean) => {
                if (!selectedElement) return;
                const selectedElementClass = GeneralUtil.elementToClassElement(selectedElement);

                if (selectedElementClass) selectedElementClass.grid(value);
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
        getFontScaledOffsetY: (fontSize: number): number => 2 * fontSize - 2,
        UI_SCALAR: 0.5,
        buttonImageOffsetX: 2,
        buttonImageOffsetY: 2,

        labelToOffset: (label: HTMLTextAreaElement): [number, number] => {

            const fontToScalingFuncMap: Map<string, (element: HTMLTextAreaElement) => [number, number]> = new Map([
                ['MinecraftRegular', (element: HTMLTextAreaElement) => {
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
                ['MinecraftTen', (element: HTMLTextAreaElement) => {
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
            ])

            const func = fontToScalingFuncMap.get(label.style.fontFamily ?? 'MinecraftRegular');
            if (!func) throw new Error(`Font fontSizeToOffset function not found for ${label.style.fontFamily ?? 'MinecraftRegular'}`);

            const offset = func(label);
            return offset;
        },
    },
    nameSpace: 'default_namespace',
    title: 'default_title',
    defaultCollectionName: 'form_buttons'
};
