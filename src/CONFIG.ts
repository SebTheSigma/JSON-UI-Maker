import { GLOBAL_ELEMENT_MAP, GlobalElementMapValue, selectedElement } from "./index.js";
import { GeneralUtil } from "./util/generalUtil.js";
import { isGridableElement, isResizeableElement } from "./elements/sharedElement.js";
import { root } from "cheerio/dist/commonjs/static.js";

const configSettings = {
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
            if (!isGridableElement(selectedElementClass)) return;

            if (selectedElementClass) selectedElementClass.grid(config.settings.show_grid.value);
        },
    },
    grid_lock_columns: {
        type: "number",
        editable: true,
        value: 2,
        displayName: "Grid Lock Columns",

        onchange: (value: number) => {
            if (!selectedElement) return;
            const selectedElementClass = GeneralUtil.elementToClassElement(selectedElement);
            if (!isGridableElement(selectedElementClass)) return;

            if (selectedElementClass) selectedElementClass.grid(config.settings.show_grid.value);
        },
    },
    grid_lock_radius: {
        type: "number",
        editable: true,
        value: 10,
        displayName: "Grid Lock Radius",
    },
    grid_lock: {
        type: "checkbox",
        editable: true,
        value: false,
        displayName: "Grid Lock",

        onchange: (value: boolean) => {
            if (!selectedElement) return;
            const selectedElementClass = GeneralUtil.elementToClassElement(selectedElement);
            if (!isGridableElement(selectedElementClass)) return;

            if (selectedElementClass) selectedElementClass.grid(config.settings.show_grid.value);
        },
    },
    show_grid: {
        type: "checkbox",
        editable: true,
        value: false,
        displayName: "Show Grid",

        onchange: (value: boolean) => {
            if (!selectedElement) return;
            const selectedElementClass = GeneralUtil.elementToClassElement(selectedElement);
            if (!isGridableElement(selectedElementClass)) return;

            if (selectedElementClass) selectedElementClass.grid(value);
        },
    },
    element_outline: {
        type: "number",
        editable: true,
        value: 2,
        displayName: "Element Outline",

        onchange: (value: number) => {
            const elements: GlobalElementMapValue[] = Array.from(GLOBAL_ELEMENT_MAP.values());

            for (const element of elements) {
                const getMainHTMLElement = element.getMainHTMLElement();
                getMainHTMLElement.style.outlineWidth = `${value}px`;
                getMainHTMLElement.style.borderWidth = `${value}px`;
            }
        },
    },
    selected_element_children_get_copied: {
        type: "checkbox",
        editable: true,
        value: false,
        displayName: "Selected Element Children Get Copied",
    },
};

const configMagicNumbers = {
    scrolling_panel_offsets: {
        scrolling_pane_right_offset: 2,
    },
    textEditor: {
        indentation: 4,
    },
    explorer: {
        folderIndentation: 10,
        nonFolderIndentation: 35,
        overallOffset: 15,
    },
    resizeHandleSize: 15,
    fontScalar: 1.6,
    fontOffsetX: 6,
    fontOffsetY: 6,
    getFontScaledOffsetY: (fontSize: number, fontType: string): number => {
        const doubleFontSize = 2 * fontSize;

        console.log(doubleFontSize, fontType, fontSize);

        if (fontType == "MinecraftRegular") return doubleFontSize - 3;
        else if (fontType == "MinecraftTen") return -1;
        else return doubleFontSize - 3;
    },
    UI_SCALAR: 0.36,
    buttonImageOffsetX: 2,
    buttonImageOffsetY: 2,

    labelToOffset: (label: HTMLTextAreaElement): [number, number] => {
        const fontToScalingFuncMap: Map<string, (element: HTMLTextAreaElement) => [number, number]> = new Map([
            [
                "MinecraftRegular",
                (element: HTMLTextAreaElement) => {
                    const fontSize = parseFloat(element.style.fontSize ?? "1");
                    let offsetX = fontSize * 1.5;
                    let offsetY = offsetX;

                    if (element.style.textAlign == "center") {
                        offsetX -= 5;
                    } else if (element.style.textAlign == "right") {
                        offsetX -= 10;
                    }

                    return [offsetX, offsetY];
                },
            ],
            [
                "MinecraftTen",
                (element: HTMLTextAreaElement) => {
                    const fontSize = parseFloat(element.style.fontSize ?? "1");
                    let offsetX = fontSize * 2.5;
                    let offsetY = offsetX;

                    if (element.style.textAlign == "center") {
                        offsetX -= 5;
                    } else if (element.style.textAlign == "right") {
                        offsetX -= 10;
                    }

                    return [offsetX, offsetY];
                },
            ],
        ]);

        const func = fontToScalingFuncMap.get(label.style.fontFamily ?? "MinecraftRegular");
        if (!func) throw new Error(`Font fontSizeToOffset function not found for ${label.style.fontFamily ?? "MinecraftRegular"}`);

        const offset = func(label);
        return offset;
    },
};

const texturePresets = {
    "turquoise_ore-ui_style": false,
};

interface Config {
    settings: typeof configSettings;
    magicNumbers: typeof configMagicNumbers;
    nameSpace: string;
    title_flag: string;
    defaultCollectionName: string;
    rootElement?: HTMLElement;
    texturePresets?: { [key: string]: boolean };
}

export const config: Config = {
    settings: configSettings,
    magicNumbers: configMagicNumbers,
    nameSpace: "default_namespace",
    title_flag: "default_title",
    defaultCollectionName: "form_buttons",
    texturePresets: texturePresets,
};
