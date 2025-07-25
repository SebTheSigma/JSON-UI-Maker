import { config } from "../CONFIG.js";
import { GLOBAL_ELEMENT_MAP } from "../index.js";
import { StringUtil } from "../util/stringUtil.js";
export const classToJsonUI = new Map([
    [
        'draggable-panel',
        (element, nameSpace) => {
            const parent = element.parentElement;
            const processedWidth = StringUtil.cssDimToNumber(element.style.width);
            const processedHeight = StringUtil.cssDimToNumber(element.style.height);
            const offset = [
                StringUtil.cssDimToNumber(element.style.left),
                StringUtil.cssDimToNumber(element.style.top),
            ];
            if (parent?.className == 'main_window') {
                offset[0] = -processedWidth / 2;
                offset[1] = -processedHeight / 2;
            }
            const jsonUIElement = {
                offset: [offset[0] * config.magicNumbers.UI_SCALAR, offset[1] * config.magicNumbers.UI_SCALAR],
                size: [processedWidth * config.magicNumbers.UI_SCALAR, processedHeight * config.magicNumbers.UI_SCALAR],
                layer: Number(element.style.zIndex),
                type: 'panel',
                anchor_from: "top_left",
                anchor_to: "top_left",
            };
            const instructions = {
                ContinuePath: true,
            };
            return { element: jsonUIElement, instructions: instructions };
        }
    ],
    [
        'draggable-collection_panel',
        (element, nameSpace) => {
            const parent = element.parentElement;
            const processedWidth = StringUtil.cssDimToNumber(element.style.width);
            const processedHeight = StringUtil.cssDimToNumber(element.style.height);
            const collectionName = element.dataset.collectionName;
            const offset = [
                StringUtil.cssDimToNumber(element.style.left),
                StringUtil.cssDimToNumber(element.style.top),
            ];
            if (parent?.className == 'main_window') {
                offset[0] = -processedWidth / 2;
                offset[1] = -processedHeight / 2;
            }
            const jsonUIElement = {
                offset: [offset[0] * config.magicNumbers.UI_SCALAR, offset[1] * config.magicNumbers.UI_SCALAR],
                size: [processedWidth * config.magicNumbers.UI_SCALAR, processedHeight * config.magicNumbers.UI_SCALAR],
                layer: Number(element.style.zIndex),
                type: 'collection_panel',
                anchor_from: "top_left",
                anchor_to: "top_left",
                collection_name: collectionName
            };
            const instructions = {
                ContinuePath: true,
            };
            return { element: jsonUIElement, instructions: instructions };
        }
    ],
    [
        'draggable-canvas',
        (element, nameSpace) => {
            const parent = element.parentElement;
            const processedWidth = StringUtil.cssDimToNumber(element.style.width);
            const processedHeight = StringUtil.cssDimToNumber(element.style.height);
            const offset = [
                StringUtil.cssDimToNumber(element.style.left),
                StringUtil.cssDimToNumber(element.style.top),
            ];
            if (parent?.className == 'main_window') {
                offset[0] = -processedWidth / 2;
                offset[1] = -processedHeight / 2;
            }
            const jsonUIElement = {
                offset: [offset[0] * config.magicNumbers.UI_SCALAR, offset[1] * config.magicNumbers.UI_SCALAR],
                size: [processedWidth * config.magicNumbers.UI_SCALAR, processedHeight * config.magicNumbers.UI_SCALAR],
                layer: Number(element.style.zIndex),
                type: 'image',
                texture: `textures/ui/${element.dataset.imageName}`,
                anchor_from: "top_left",
                anchor_to: "top_left",
            };
            const instructions = {
                ContinuePath: true,
            };
            return { element: jsonUIElement, instructions: instructions };
        }
    ],
    [
        'draggable-button',
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
            const offset = [
                StringUtil.cssDimToNumber(element.style.left),
                StringUtil.cssDimToNumber(element.style.top),
            ];
            if (parent?.className == 'main_window') {
                offset[0] = -processedWidth / 2;
                offset[1] = -processedHeight / 2;
            }
            // Gets the display canvas
            const id = element.dataset.id;
            const buttonIdToDisplayCanvasJsonUi = (id) => {
                const buttonClass = GLOBAL_ELEMENT_MAP.get(id);
                const displayCanvas = buttonClass.displayCanvas;
                const transformationFunc = classToJsonUI.get('draggable-canvas');
                if (!transformationFunc)
                    return undefined;
                const result = transformationFunc(displayCanvas.canvasHolder, nameSpace);
                if (!result)
                    return undefined;
                return result.element;
            };
            const DisplayElementJsonUi = buttonIdToDisplayCanvasJsonUi(id);
            const jsonUIElement = {
                $offset_test: [offset[0] * config.magicNumbers.UI_SCALAR, offset[1] * config.magicNumbers.UI_SCALAR],
                $button_size: [processedWidth * config.magicNumbers.UI_SCALAR, processedHeight * config.magicNumbers.UI_SCALAR],
                layer: Number(element.style.zIndex),
                anchor_from: "top_left",
                anchor_to: "top_left",
                $default_button_background_texture: defaultTex,
                $hover_button_background_texture: hoverTex,
                $pressed_button_background_texture: pressedTex,
                collection_index: collectionIndex,
                $icon_offset: [
                    (DisplayElementJsonUi.offset[0] ?? 0) + config.magicNumbers.buttonImageOffsetX,
                    (DisplayElementJsonUi.offset[1] ?? 0) + config.magicNumbers.buttonImageOffsetY
                ],
                $icon_size: [DisplayElementJsonUi.size[0] ?? 45, DisplayElementJsonUi.size[1] ?? 45],
            };
            const instructions = {
                ContinuePath: false,
                CommonElementLink: `@${nameSpace}.custom_button`
            };
            return { element: jsonUIElement, instructions: instructions };
        }
    ],
    [
        'draggable-label',
        (element, nameSpace) => {
            const parent = element.parentElement;
            const processedWidth = StringUtil.cssDimToNumber(element.style.width);
            const processedHeight = StringUtil.cssDimToNumber(element.style.height);
            const offset = [
                StringUtil.cssDimToNumber(element.style.left),
                StringUtil.cssDimToNumber(element.style.top),
            ];
            if (parent?.className == 'main_window') {
                offset[0] = -processedWidth / 2;
                offset[1] = -processedHeight / 2;
            }
            const jsonUIElement = {
                offset: [
                    (offset[0] + config.magicNumbers.fontOffsetX) * config.magicNumbers.UI_SCALAR,
                    (offset[1] + config.magicNumbers.fontOffsetY) * config.magicNumbers.UI_SCALAR
                ],
                layer: Number(element.style.zIndex),
                type: 'label',
                anchor_from: "top_left",
                anchor_to: "top_left",
                text: element.value,
                font_scale_factor: (parseFloat(element.style.fontSize) * config.magicNumbers.fontScalar) * config.magicNumbers.UI_SCALAR,
                text_alignment: element.style.textAlign ?? "left"
            };
            console.log(JSON.stringify(jsonUIElement));
            const instructions = {
                ContinuePath: false,
            };
            return { element: jsonUIElement, instructions: instructions };
        }
    ],
]);
//# sourceMappingURL=HTMLClassToJonUITypes.js.map