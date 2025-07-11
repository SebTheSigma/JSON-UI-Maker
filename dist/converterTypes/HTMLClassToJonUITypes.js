import { StringUtil } from "../util/stringUtil.js";
export const classToJsonUI = new Map([
    [
        'draggable-panel',
        (element) => {
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
            return {
                offset: offset,
                size: [processedWidth, processedHeight],
                layer: Number(element.style.zIndex),
                type: 'panel',
                anchor_from: "top_left",
                anchor_to: "top_left",
            };
        }
    ],
    [
        'draggable-canvas',
        (element) => {
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
            return {
                offset: offset,
                size: [processedWidth, processedHeight],
                layer: Number(element.style.zIndex),
                type: 'image',
                texture: `textures/ui/${element.dataset.imageName}`,
                anchor_from: "top_left",
                anchor_to: "top_left",
            };
        }
    ],
    [
        'draggable-button',
        (element) => {
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
            return {
                $offset: offset,
                $size: [processedWidth, processedHeight],
                $layer: Number(element.style.zIndex),
                $type: 'image',
                $texture: `textures/ui/${element.dataset.imageName}`,
                $anchor_from: "top_left",
                $anchor_to: "top_left",
            };
        }
    ]
]);
//# sourceMappingURL=HTMLClassToJonUITypes.js.map