import { config } from "../CONFIG.js";
import { GeneralUtil } from "../util/generalUtil.js";
import { StringUtil } from "../util/stringUtil.js";
export const classToJsonUI = new Map([
    [
        "draggable-panel",
        (element, nameSpace) => {
            const parent = element.parentElement;
            const rect = element.getBoundingClientRect();
            const processedWidth = rect.width;
            const processedHeight = rect.height;
            const panelClass = GeneralUtil.elementToClassElement(element);
            const offset = [StringUtil.cssDimToNumber(element.style.left), StringUtil.cssDimToNumber(element.style.top)];
            if (parent?.className == "main_window") {
                offset[0] = -processedWidth / 2;
                offset[1] = -processedHeight / 2;
            }
            const ui_scaler = config.magicNumbers.UI_SCALAR;
            const bindings = GeneralUtil.tryParseBindings(panelClass.bindings) ?? [];
            console.log(offset, processedHeight, processedWidth, element.style.width, element.style.height);
            const jsonUIElement = {
                offset: [offset[0] * ui_scaler, offset[1] * ui_scaler],
                size: [processedWidth * ui_scaler, processedHeight * ui_scaler],
                layer: Number(element.style.zIndex),
                type: "panel",
                anchor_from: "top_left",
                anchor_to: "top_left",
                bindings: bindings,
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
            const collectionPanelClass = GeneralUtil.elementToClassElement(element);
            const offset = [StringUtil.cssDimToNumber(element.style.left), StringUtil.cssDimToNumber(element.style.top)];
            if (parent?.className == "main_window") {
                offset[0] = -processedWidth / 2;
                offset[1] = -processedHeight / 2;
            }
            const ui_scaler = config.magicNumbers.UI_SCALAR;
            const bindings = GeneralUtil.tryParseBindings(collectionPanelClass.bindings) ?? [];
            const jsonUIElement = {
                offset: [offset[0] * ui_scaler, offset[1] * ui_scaler],
                size: [processedWidth * ui_scaler, processedHeight * ui_scaler],
                layer: Number(element.style.zIndex),
                type: "collection_panel",
                anchor_from: "top_left",
                anchor_to: "top_left",
                collection_name: collectionName,
                bindings: bindings,
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
            const canvasClass = GeneralUtil.elementToClassElement(element);
            const offset = [StringUtil.cssDimToNumber(element.style.left), StringUtil.cssDimToNumber(element.style.top)];
            if (parent?.className == "main_window") {
                offset[0] = -processedWidth / 2;
                offset[1] = -processedHeight / 2;
            }
            const ui_scaler = config.magicNumbers.UI_SCALAR;
            const bindings = GeneralUtil.tryParseBindings(canvasClass.bindings) ?? [];
            const jsonUIElement = {
                offset: [offset[0] * ui_scaler, offset[1] * ui_scaler],
                size: [processedWidth * ui_scaler, processedHeight * ui_scaler],
                layer: Number(element.style.zIndex),
                type: "image",
                texture: `textures/${element.dataset.imagePath}`,
                anchor_from: "top_left",
                anchor_to: "top_left",
                bindings: bindings,
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
            const defaultTex = `textures/${element.dataset.defaultImagePath}`;
            const hoverTex = `textures/${element.dataset.hoverImagePath}`;
            const pressedTex = `textures/${element.dataset.pressedImagePath}`;
            console.warn(element.dataset.defaultImagePath, element.dataset.hoverImagePath, element.dataset.pressedImagePath, defaultTex, hoverTex, pressedTex);
            const collectionIndex = Number(element.dataset.collectionIndex);
            const offset = [StringUtil.cssDimToNumber(element.style.left), StringUtil.cssDimToNumber(element.style.top)];
            if (parent?.className == "main_window") {
                offset[0] = -processedWidth / 2;
                offset[1] = -processedHeight / 2;
            }
            const buttonClass = GeneralUtil.elementToClassElement(element);
            console.log("buttonClass", buttonClass);
            const buttonIdToDisplayCanvasJsonUi = () => {
                const displayCanvas = buttonClass.displayCanvas;
                if (!displayCanvas)
                    return undefined;
                const transformationFunc = classToJsonUI.get("draggable-canvas");
                if (!transformationFunc)
                    return undefined;
                const result = transformationFunc(displayCanvas.canvasHolder, nameSpace);
                if (!result)
                    return undefined;
                return result.element;
            };
            const buttonIdToDisplayTextJsonUi = () => {
                const displayText = buttonClass.displayText;
                if (!displayText)
                    return undefined;
                const transformationFunc = classToJsonUI.get("draggable-label");
                if (!transformationFunc)
                    return undefined;
                const result = transformationFunc(displayText.label, nameSpace);
                if (!result)
                    return undefined;
                return result.element;
            };
            const DisplayElementJsonUi = buttonIdToDisplayCanvasJsonUi();
            const TextElementJsonUi = buttonIdToDisplayTextJsonUi();
            const ui_scaler = config.magicNumbers.UI_SCALAR;
            const bindings = GeneralUtil.tryParseBindings(buttonClass.bindings) ?? [];
            const jsonUIElement = {
                $default_button_background_texture: defaultTex,
                $hover_button_background_texture: hoverTex,
                $pressed_button_background_texture: pressedTex,
                $button_offset: [offset[0] * ui_scaler, offset[1] * ui_scaler],
                $button_size: [processedWidth * ui_scaler, processedHeight * ui_scaler],
                layer: Number(element.style.zIndex),
                anchor_from: "top_left",
                anchor_to: "top_left",
                collection_index: collectionIndex,
                $icon_offset: [
                    (DisplayElementJsonUi?.offset?.[0] ?? 0) + config.magicNumbers.buttonImageOffsetX,
                    (DisplayElementJsonUi?.offset?.[1] ?? 0) + config.magicNumbers.buttonImageOffsetY,
                ],
                $icon_size: [DisplayElementJsonUi?.size?.[0] ?? 45, DisplayElementJsonUi?.size?.[1] ?? 45],
                $font_size: TextElementJsonUi?.font_scale_factor ?? 1,
                $text_offset: [TextElementJsonUi?.offset?.[0] ?? 0, TextElementJsonUi?.offset?.[1] ?? 0],
                $font_type: TextElementJsonUi?.font_type ?? "MinecraftRegular",
                $shadow: TextElementJsonUi?.shadow ?? false,
                $text_alignment: TextElementJsonUi?.text_alignment ?? "center",
                $show_hover_text: false,
                bindings: bindings,
            };
            console.warn(jsonUIElement);
            const instructions = {
                ContinuePath: false,
                CommonElementLink: `@${nameSpace}.custom_button`,
            };
            if (!DisplayElementJsonUi || !TextElementJsonUi) {
                instructions.Warning = {
                    message: "No display image or display text found for button",
                };
            }
            return { element: jsonUIElement, instructions: instructions };
        },
    ],
    [
        "draggable-label",
        (element, nameSpace) => {
            const parent = element.parentElement;
            const classElement = GeneralUtil.elementToClassElement(element);
            const processedWidth = StringUtil.cssDimToNumber(element.style.width);
            const processedHeight = StringUtil.cssDimToNumber(element.style.height);
            const offset = [StringUtil.cssDimToNumber(element.style.left), StringUtil.cssDimToNumber(element.style.top)];
            if (parent?.className == "main_window") {
                offset[0] = -processedWidth / 2;
                offset[1] = -processedHeight / 2;
            }
            const ui_scaler = config.magicNumbers.UI_SCALAR;
            const getFontScaledOffsetY = config.magicNumbers.getFontScaledOffsetY;
            const bindings = GeneralUtil.tryParseBindings(classElement.bindings) ?? [];
            const jsonUIElement = {
                offset: [
                    (offset[0] + config.magicNumbers.fontOffsetX) * ui_scaler,
                    (offset[1] + config.magicNumbers.fontOffsetY) * ui_scaler +
                        getFontScaledOffsetY(parseFloat(element.style.fontSize), element.style.fontFamily ?? "MinecraftRegular"),
                ],
                layer: Number(element.style.zIndex),
                type: "label",
                anchor_from: "top_left",
                anchor_to: "top_left",
                text: element.value,
                font_scale_factor: parseFloat(element.style.fontSize) * config.magicNumbers.fontScalar * ui_scaler,
                text_alignment: element.style.textAlign ?? "left",
                font_type: element.style.fontFamily ?? "MinecraftRegular",
                shadow: classElement.hasShadow,
                bindings: bindings,
            };
            const instructions = {
                ContinuePath: false,
            };
            return { element: jsonUIElement, instructions: instructions };
        },
    ],
    [
        "draggable-scrolling_panel",
        (element, nameSpace) => {
            // Has the position of the panel as the panel is strictly used for scrolling
            // and cant have positional properties
            const basePanel = element.parentElement;
            const parent = basePanel?.parentElement;
            const elementClass = GeneralUtil.elementToClassElement(element);
            const processedWidth = StringUtil.cssDimToNumber(basePanel.style.width);
            const processedHeight = StringUtil.cssDimToNumber(basePanel.style.height);
            const offset = [StringUtil.cssDimToNumber(basePanel.style.left), StringUtil.cssDimToNumber(basePanel.style.top)];
            if (parent?.className == "main_window") {
                offset[0] = -processedWidth / 2;
                offset[1] = -processedHeight / 2;
            }
            const ui_scaler = config.magicNumbers.UI_SCALAR;
            const right_offset = config.magicNumbers.scrolling_panel_offsets.scrolling_pane_right_offset;
            const jsonUIElement = {
                offset: [offset[0] * ui_scaler + right_offset, offset[1] * ui_scaler],
                size: [processedWidth * ui_scaler, processedHeight * ui_scaler],
                layer: Number(element.style.zIndex),
                type: "panel",
                anchor_from: "top_left",
                anchor_to: "top_left",
                $scroll_size: [10 * ui_scaler, processedHeight * ui_scaler],
                $scrolling_pane_size: [processedWidth * ui_scaler, processedHeight * ui_scaler],
                $scrolling_pane_offset: [0, 0],
                $scroll_bar_right_padding_size: [right_offset, 0],
            };
            const newTreeLink = `${nameSpace}.${StringUtil.generateRandomString(8)}-skip`;
            const instructions = {
                ContinuePath: true,
                NewTree: {
                    link: newTreeLink,
                    startingNode: "basicPanelScrollingContent",
                },
            };
            const bindings = GeneralUtil.tryParseBindings(elementClass.bindings) ?? [];
            const structure = {
                type: "stack_panel",
                size: jsonUIElement.size,
                orientation: "vertical",
                layer: jsonUIElement.layer,
                anchor_to: "top_left",
                anchor_from: "top_left",
                controls: [
                    {
                        [`${StringUtil.generateRandomString(8)}-sc_linker_panel@common.scrolling_panel`]: {
                            anchor_to: "top_left",
                            anchor_from: "top_left",
                            $show_background: false,
                            size: ["100%", "100%"],
                            $scrolling_content: newTreeLink,
                            $scroll_size: jsonUIElement.$scroll_size,
                            $scrolling_pane_size: jsonUIElement.$scrolling_pane_size,
                            $scrolling_pane_offset: jsonUIElement.offset,
                            $scroll_bar_right_padding_size: jsonUIElement.$scroll_bar_right_padding_size,
                            bindings: bindings,
                        },
                    },
                ],
            };
            return { element: structure, instructions: instructions };
        },
    ],
]);
export const classToTagName = new Map([
    ["draggable-panel", "panel"],
    ["draggable-canvas", "image"],
    ["draggable-button", "button"],
    ["draggable-collection_panel", "collection_panel"],
    ["draggable-label", "label"],
    ["draggable-scrolling_panel", "scrolling_panel"],
]);
//# sourceMappingURL=HTMLClassToJonUITypes.js.map