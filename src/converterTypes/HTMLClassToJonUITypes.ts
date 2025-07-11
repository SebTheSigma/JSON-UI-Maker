import { StringUtil } from "../util/stringUtil";

export interface JsonUISimpleElement {
    [key: string]: any;
    controls?: object[];
}

export const classToJsonUI: Map<string, (element: HTMLElement) => JsonUISimpleElement> = new Map([
    [
        'draggable-panel',
        (element: HTMLElement): JsonUISimpleElement => {
            const parent = element.parentElement!;
            const processedWidth = StringUtil.cssDimToNumber(element.style.width);
            const processedHeight = StringUtil.cssDimToNumber(element.style.height);

            const offset: [number, number] = [
                StringUtil.cssDimToNumber(element.style.left),
                StringUtil.cssDimToNumber(element.style.top),
            ];

            if (parent?.className == 'main_window') {
                offset[0] = - processedWidth / 2;
                offset[1] = - processedHeight / 2;
            }

            return {
                offset: offset,
                size: [processedWidth, processedHeight],
                layer: Number(element.style.zIndex),
                type: 'panel',
                anchor_from: "top_left",
                anchor_to: "top_left",
            }
        }
    ],
    [
        'draggable-canvas',
        (element: HTMLElement): JsonUISimpleElement => {
            const parent = element.parentElement!;
            const processedWidth = StringUtil.cssDimToNumber(element.style.width);
            const processedHeight = StringUtil.cssDimToNumber(element.style.height);

            const offset: [number, number] = [
                StringUtil.cssDimToNumber(element.style.left),
                StringUtil.cssDimToNumber(element.style.top),
            ];

            if (parent?.className == 'main_window') {
                offset[0] = - processedWidth / 2;
                offset[1] = - processedHeight / 2;
            }

            return {
                offset: offset,
                size: [processedWidth, processedHeight],
                layer: Number(element.style.zIndex),
                type: 'image',
                texture: `textures/ui/${element.dataset.imageName!}`,
                anchor_from: "top_left",
                anchor_to: "top_left",
            }
        }
    ],
    [
        'draggable-button',
        (element: HTMLElement): JsonUISimpleElement => {
            const parent = element.parentElement!;
            const processedWidth = StringUtil.cssDimToNumber(element.style.width);
            const processedHeight = StringUtil.cssDimToNumber(element.style.height);

            const offset: [number, number] = [
                StringUtil.cssDimToNumber(element.style.left),
                StringUtil.cssDimToNumber(element.style.top),
            ];

            if (parent?.className == 'main_window') {
                offset[0] = - processedWidth / 2;
                offset[1] = - processedHeight / 2;
            }

            return {
                $offset: offset,
                $size: [processedWidth, processedHeight],
                $layer: Number(element.style.zIndex),
                $type: 'image',
                $texture: `textures/ui/${element.dataset.imageName!}`,
                $anchor_from: "top_left",
                $anchor_to: "top_left",
            }
        }
    ]
])