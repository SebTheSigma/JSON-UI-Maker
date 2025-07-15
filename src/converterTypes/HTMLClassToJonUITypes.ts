import { config } from "../CONFIG.js";
import { TreeData, TreeInstructions } from "../converter.js";
import { StringUtil } from "../util/stringUtil.js";

export interface JsonUISimpleElement {
    [key: string]: any;
    controls?: object[];
}

export const classToJsonUI: Map<string, (element: HTMLElement, nameSpace: string) => TreeData> = new Map([
    [
        'draggable-panel',
        (element: HTMLElement, nameSpace: string) => {
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

            const jsonUIElement: JsonUISimpleElement = {
                offset: offset,
                size: [processedWidth, processedHeight],
                layer: Number(element.style.zIndex),
                type: 'panel',
                anchor_from: "top_left",
                anchor_to: "top_left",
            }

            const instructions: TreeInstructions = {
                ContinuePath: true,
            };

            return { element: jsonUIElement, instructions: instructions };
        }
    ],
    [
        'draggable-collection_panel',
        (element: HTMLElement, nameSpace: string) => {
            const parent = element.parentElement!;
            const processedWidth = StringUtil.cssDimToNumber(element.style.width);
            const processedHeight = StringUtil.cssDimToNumber(element.style.height);

            const collectionName: string = element.dataset.collectionName!;

            const offset: [number, number] = [
                StringUtil.cssDimToNumber(element.style.left),
                StringUtil.cssDimToNumber(element.style.top),
            ];

            if (parent?.className == 'main_window') {
                offset[0] = - processedWidth / 2;
                offset[1] = - processedHeight / 2;
            }

            const jsonUIElement: JsonUISimpleElement = {
                offset: offset,
                size: [processedWidth, processedHeight],
                layer: Number(element.style.zIndex),
                type: 'collection_panel',
                anchor_from: "top_left",
                anchor_to: "top_left",
                collection_name: collectionName
            }

            const instructions: TreeInstructions = {
                ContinuePath: true,
            };

            return { element: jsonUIElement, instructions: instructions };
        }
    ],
    [
        'draggable-canvas',
        (element: HTMLElement, nameSpace: string) => {
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

            const jsonUIElement: JsonUISimpleElement = {
                offset: offset,
                size: [processedWidth, processedHeight],
                layer: Number(element.style.zIndex),
                type: 'image',
                texture: `textures/ui/${element.dataset.imageName!}`,
                anchor_from: "top_left",
                anchor_to: "top_left",
            }

            const instructions: TreeInstructions = {
                ContinuePath: true,
            };

            return { element: jsonUIElement, instructions: instructions };
        }
    ],
    [
        'draggable-button',
        (element: HTMLElement, nameSpace: string) => {
            const parent = element.parentElement!;
            const processedWidth = StringUtil.cssDimToNumber(element.style.width);
            const processedHeight = StringUtil.cssDimToNumber(element.style.height);

            const fileToTex = (fileName: string): string => {
                return `textures/ui/${fileName}`;
            }

            const defaultTex = fileToTex(element.dataset.defaultImageName!);
            const hoverTex = fileToTex(element.dataset.hoverImageName!);
            const pressedTex = fileToTex(element.dataset.pressedImageName!);

            const collectionIndex: number = Number(element.dataset.collectionIndex!);

            const offset: [number, number] = [
                StringUtil.cssDimToNumber(element.style.left),
                StringUtil.cssDimToNumber(element.style.top),
            ];

            if (parent?.className == 'main_window') {
                offset[0] = - processedWidth / 2;
                offset[1] = - processedHeight / 2;
            }

            const jsonUIElement: JsonUISimpleElement = {
                $offset_test: offset,
                $button_size: [processedWidth, processedHeight],
                layer: Number(element.style.zIndex),
                anchor_from: "top_left",
                anchor_to: "top_left",
                $default_button_background_texture: defaultTex,
                $hover_button_background_texture: hoverTex,
                $pressed_button_background_texture: pressedTex,
                collection_index: collectionIndex
            }

            const instructions: TreeInstructions = {
                ContinuePath: false,
                CommonElementLink: `@${nameSpace}.custom_button`
            };

            return { element: jsonUIElement, instructions: instructions };
        }
    ],
    [
        'draggable-label',
        (element: HTMLElement, nameSpace: string) => {
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

            const jsonUIElement: JsonUISimpleElement = {
                offset: [offset[0] + 6, offset[1] + 6],
                layer: Number(element.style.zIndex),
                type: 'label',
                anchor_from: "top_left",
                anchor_to: "top_left",
                text: (element as HTMLTextAreaElement).value!,
                font_scale_factor: parseFloat(element.style.fontSize) * config.magicNumbers.fontScalar!,
                text_alignment: element.style.textAlign ?? "left",
                font_color: []
            }

            console.log(JSON.stringify(jsonUIElement))

            const instructions: TreeInstructions = {
                ContinuePath: false,
            };

            return { element: jsonUIElement, instructions: instructions };
        }
    ],
])
