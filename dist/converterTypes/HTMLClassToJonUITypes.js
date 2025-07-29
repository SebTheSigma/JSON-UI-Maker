import { config } from "../CONFIG.js";
import { GLOBAL_ELEMENT_MAP } from "../index.js";
import { StringUtil } from "../util/stringUtil.js";
export const classToJsonUI = new Map([
    [
        "draggable-panel",
        (element, nameSpace) => {
            const parent = element.parentElement;
            const processedWidth = StringUtil.cssDimToNumber(element.style.width);
            const processedHeight = StringUtil.cssDimToNumber(element.style.height);
            const offset = [StringUtil.cssDimToNumber(element.style.left), StringUtil.cssDimToNumber(element.style.top)];
            if (parent?.className == "main_window") {
                offset[0] = -processedWidth / 2;
                offset[1] = -processedHeight / 2;
            }
            const ui_scaler = config.magicNumbers.UI_SCALAR;
            const jsonUIElement = {
                offset: [offset[0] * ui_scaler, offset[1] * ui_scaler],
                size: [processedWidth * ui_scaler, processedHeight * ui_scaler],
                layer: Number(element.style.zIndex),
                type: "panel",
                anchor_from: "top_left",
                anchor_to: "top_left",
            };
            const instructions = {
                ContinuePath: true,
            };
            return { element: jsonUIElement, instructions: instructions };
        },
    ],
    [
        "draggable-collection_panel",
        (element, nameSpace) => {
            const parent = element.parentElement;
            const processedWidth = StringUtil.cssDimToNumber(element.style.width);
            const processedHeight = StringUtil.cssDimToNumber(element.style.height);
            const collectionName = element.dataset.collectionName;
            const offset = [StringUtil.cssDimToNumber(element.style.left), StringUtil.cssDimToNumber(element.style.top)];
            if (parent?.className == "main_window") {
                offset[0] = -processedWidth / 2;
                offset[1] = -processedHeight / 2;
            }
            const ui_scaler = config.magicNumbers.UI_SCALAR;
            const jsonUIElement = {
                offset: [offset[0] * ui_scaler, offset[1] * ui_scaler],
                size: [processedWidth * ui_scaler, processedHeight * ui_scaler],
                layer: Number(element.style.zIndex),
                type: "collection_panel",
                anchor_from: "top_left",
                anchor_to: "top_left",
                collection_name: collectionName,
            };
            const instructions = {
                ContinuePath: true,
            };
            return { element: jsonUIElement, instructions: instructions };
        },
    ],
    [
        "draggable-canvas",
        (element, nameSpace) => {
            const parent = element.parentElement;
            const processedWidth = StringUtil.cssDimToNumber(element.style.width);
            const processedHeight = StringUtil.cssDimToNumber(element.style.height);
            const offset = [StringUtil.cssDimToNumber(element.style.left), StringUtil.cssDimToNumber(element.style.top)];
            if (parent?.className == "main_window") {
                offset[0] = -processedWidth / 2;
                offset[1] = -processedHeight / 2;
            }
            const ui_scaler = config.magicNumbers.UI_SCALAR;
            const jsonUIElement = {
                offset: [offset[0] * ui_scaler, offset[1] * ui_scaler],
                size: [processedWidth * ui_scaler, processedHeight * ui_scaler],
                layer: Number(element.style.zIndex),
                type: "image",
                texture: `textures/ui/${element.dataset.imageName}`,
                anchor_from: "top_left",
                anchor_to: "top_left",
            };
            const instructions = {
                ContinuePath: true,
            };
            return { element: jsonUIElement, instructions: instructions };
        },
    ],
    [
        "draggable-button",
        (element, nameSpace) => {
            const parent = element.parentElement;
            const processedWidth = StringUtil.cssDimToNumber(element.style.width);
            const processedHeight = StringUtil.cssDimToNumber(element.style.height);
            const fileToTex = (fileName) => {
                return `textures/ui/${fileName}`;
            };
            const defaultTex = fileToTex(element.dataset.defaultImageName);
            const hoverTex = fileToTex(element.dataset.hoverImageName);
            const pressedTex = fileToTex(element.dataset.pressedImageName);
            const collectionIndex = Number(element.dataset.collectionIndex);
            const offset = [StringUtil.cssDimToNumber(element.style.left), StringUtil.cssDimToNumber(element.style.top)];
            if (parent?.className == "main_window") {
                offset[0] = -processedWidth / 2;
                offset[1] = -processedHeight / 2;
            }
            // Gets the display canvas
            const id = element.dataset.id;
            const buttonIdToDisplayCanvasJsonUi = (id) => {
                const buttonClass = GLOBAL_ELEMENT_MAP.get(id);
                const displayCanvas = buttonClass.displayCanvas;
                const transformationFunc = classToJsonUI.get("draggable-canvas");
                if (!transformationFunc)
                    return undefined;
                const result = transformationFunc(displayCanvas.canvasHolder, nameSpace);
                if (!result)
                    return undefined;
                return result.element;
            };
            const buttonIdToDisplayTextJsonUi = (id) => {
                const buttonClass = GLOBAL_ELEMENT_MAP.get(id);
                const displayCanvas = buttonClass.displayText;
                const transformationFunc = classToJsonUI.get("draggable-label");
                if (!transformationFunc)
                    return undefined;
                const result = transformationFunc(displayCanvas.label, nameSpace);
                if (!result)
                    return undefined;
                return result.element;
            };
            const DisplayElementJsonUi = buttonIdToDisplayCanvasJsonUi(id);
            const TextElementJsonUi = buttonIdToDisplayTextJsonUi(id);
            const ui_scaler = config.magicNumbers.UI_SCALAR;
            const jsonUIElement = {
                $offset_test: [offset[0] * ui_scaler, offset[1] * ui_scaler],
                $button_size: [processedWidth * ui_scaler, processedHeight * ui_scaler],
                layer: Number(element.style.zIndex),
                anchor_from: "top_left",
                anchor_to: "top_left",
                $default_button_background_texture: defaultTex,
                $hover_button_background_texture: hoverTex,
                $pressed_button_background_texture: pressedTex,
                collection_index: collectionIndex,
                $icon_offset: [
                    (DisplayElementJsonUi.offset[0] ?? 0) + config.magicNumbers.buttonImageOffsetX,
                    (DisplayElementJsonUi.offset[1] ?? 0) + config.magicNumbers.buttonImageOffsetY,
                ],
                $icon_size: [DisplayElementJsonUi.size[0] ?? 45, DisplayElementJsonUi.size[1] ?? 45],
                $font_size: TextElementJsonUi.font_scale_factor ?? 1,
                $text_offset: [TextElementJsonUi.offset[0] ?? 0, TextElementJsonUi.offset[1] ?? 0],
            };
            const instructions = {
                ContinuePath: true,
                CommonElementLink: `@${nameSpace}.custom_button`,
            };
            return { element: jsonUIElement, instructions: instructions };
        },
    ],
    [
        "draggable-label",
        (element, nameSpace) => {
            const parent = element.parentElement;
            const processedWidth = StringUtil.cssDimToNumber(element.style.width);
            const processedHeight = StringUtil.cssDimToNumber(element.style.height);
            const offset = [StringUtil.cssDimToNumber(element.style.left), StringUtil.cssDimToNumber(element.style.top)];
            if (parent?.className == "main_window") {
                offset[0] = -processedWidth / 2;
                offset[1] = -processedHeight / 2;
            }
            const ui_scaler = config.magicNumbers.UI_SCALAR;
            const getFontScaledOffsetY = config.magicNumbers.getFontScaledOffsetY;
            const jsonUIElement = {
                offset: [
                    (offset[0] + config.magicNumbers.fontOffsetX) * ui_scaler,
                    (offset[1] + config.magicNumbers.fontOffsetY) * ui_scaler + getFontScaledOffsetY(parseFloat(element.style.fontSize)),
                ],
                layer: Number(element.style.zIndex),
                type: "label",
                anchor_from: "top_left",
                anchor_to: "top_left",
                text: element.value,
                font_scale_factor: parseFloat(element.style.fontSize) * config.magicNumbers.fontScalar * ui_scaler,
                text_alignment: element.style.textAlign ?? "left",
            };
            console.log(JSON.stringify(jsonUIElement));
            const instructions = {
                ContinuePath: false,
            };
            return { element: jsonUIElement, instructions: instructions };
        },
    ],
    [
        "draggable-scrolling_panel",
        (element, nameSpace) => {
            const parent = element.parentElement;
            const processedWidth = StringUtil.cssDimToNumber(element.style.width);
            const processedHeight = StringUtil.cssDimToNumber(element.style.height);
            const offset = [StringUtil.cssDimToNumber(element.style.left), StringUtil.cssDimToNumber(element.style.top)];
            if (parent?.className == "main_window") {
                offset[0] = -processedWidth / 2;
                offset[1] = -processedHeight / 2;
            }
            const ui_scaler = config.magicNumbers.UI_SCALAR;
            const jsonUIElement = {
                offset: [offset[0] * ui_scaler, offset[1] * ui_scaler],
                size: [processedWidth * ui_scaler, processedHeight * ui_scaler],
                layer: Number(element.style.zIndex),
                type: "panel",
                anchor_from: "top_left",
                anchor_to: "top_left",
            };
            const instructions = {
                ContinuePath: true,
            };
            return { element: jsonUIElement, instructions: instructions };
        },
    ],
    [
        "draggable-scrolling_panel",
        (element, nameSpace) => {
            const parent = element.parentElement;
            const processedWidth = StringUtil.cssDimToNumber(element.style.width);
            const processedHeight = StringUtil.cssDimToNumber(element.style.height);
            const offset = [StringUtil.cssDimToNumber(element.style.left), StringUtil.cssDimToNumber(element.style.top)];
            if (parent?.className == "main_window") {
                offset[0] = -processedWidth / 2;
                offset[1] = -processedHeight / 2;
            }
            const ui_scaler = config.magicNumbers.UI_SCALAR;
            const jsonUIElement = {
                offset: [offset[0] * ui_scaler, offset[1] * ui_scaler],
                size: [processedWidth * ui_scaler, processedHeight * ui_scaler],
                layer: Number(element.style.zIndex),
                type: "panel",
                anchor_from: "top_left",
                anchor_to: "top_left",
                $scroll_size: [5 * ui_scaler, (processedHeight - 4) * ui_scaler],
                $scrolling_pane_size: [(processedWidth - 4) * ui_scaler, (processedHeight - 4) * ui_scaler],
                $scrolling_pane_offset: [0, 0],
                $scroll_bar_right_padding_size: [0, 0],
            };
            const newTreeLink = `${nameSpace}.${StringUtil.generateRandomString(8)}`;
            const instructions = {
                ContinuePath: true,
                NewTreeFromBaseNode: newTreeLink,
                rootStarterElement: "basicPanelScrollingContent",
            };
            const structure = {
                type: "stack_panel",
                size: jsonUIElement.size,
                orientation: "vertical",
                layer: jsonUIElement.layer,
                anchor_to: "top_left",
                anchor_from: "top_left",
                controls: [
                    {
                        [`${StringUtil.generateRandomString(8)}@common.scrolling_panel`]: {
                            anchor_to: "top_left",
                            anchor_from: "top_left",
                            $show_background: false,
                            size: ["100%", "100%"],
                            $scrolling_content: newTreeLink,
                            $scroll_size: jsonUIElement.$scroll_size,
                            $scrolling_pane_size: jsonUIElement.$scrolling_pane_size,
                            $scrolling_pane_offset: jsonUIElement.offset,
                            $scroll_bar_right_padding_size: jsonUIElement.$scroll_bar_right_padding_size,
                        },
                    },
                ],
            };
            return { element: structure, instructions: instructions };
        },
    ],
]);
//# sourceMappingURL=HTMLClassToJonUITypes.js.map