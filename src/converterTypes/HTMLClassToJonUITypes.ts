import { config } from "../CONFIG.js";
import { TreeData, TreeInstructions } from "../converter.js";
import { DraggableButton } from "../elements/button.js";
import { DraggableCanvas } from "../elements/canvas.js";
import { DraggableCollectionPanel } from "../elements/collectionPanel.js";
import { DraggableLabel } from "../elements/label.js";
import { DraggablePanel } from "../elements/panel.js";
import { DraggableScrollingPanel } from "../elements/scrollingPanel.js";
import { GeneralUtil } from "../util/generalUtil.js";
import { StringUtil } from "../util/stringUtil.js";

export interface JsonUISimpleElement {
    [key: string]: any;
    controls?: object[];
}

export const classToJsonUI: Map<string, (element: HTMLElement, nameSpace: string) => TreeData> = new Map([
    [
        "draggable-panel",
        (element: HTMLElement, nameSpace: string) => {
            const parent = element.parentElement!;

            const rect = element.getBoundingClientRect();
            const processedWidth = rect.width;
            const processedHeight = rect.height;

            const panelClass = GeneralUtil.elementToClassElement(element) as DraggablePanel;

            const offset: [number, number] = [StringUtil.cssDimToNumber(element.style.left), StringUtil.cssDimToNumber(element.style.top)];

            if (parent?.className == "main_window") {
                offset[0] = -processedWidth / 2;
                offset[1] = -processedHeight / 2;
            }

            const ui_scaler = config.magicNumbers.UI_SCALAR as number;

            const bindings = GeneralUtil.tryParseBindings(panelClass.bindings) ?? [];

            console.log(offset, processedHeight, processedWidth, element.style.width, element.style.height);

            const jsonUIElement: JsonUISimpleElement = {
                offset: [offset[0] * ui_scaler, offset[1] * ui_scaler],
                size: [processedWidth * ui_scaler, processedHeight * ui_scaler],
                layer: Number(element.style.zIndex),
                type: "panel",
                anchor_from: "top_left",
                anchor_to: "top_left",

                bindings: bindings,
            };

            const instructions: TreeInstructions = {
                ContinuePath: true,
            };

            return { element: jsonUIElement, instructions: instructions };
        },
    ],
    [
        "draggable-collection_panel",
        (element: HTMLElement, nameSpace: string) => {
            const parent = element.parentElement!;
            const processedWidth = StringUtil.cssDimToNumber(element.style.width);
            const processedHeight = StringUtil.cssDimToNumber(element.style.height);

            const collectionName: string = element.dataset.collectionName!;

            const collectionPanelClass = GeneralUtil.elementToClassElement(element) as DraggableCollectionPanel;

            const offset: [number, number] = [StringUtil.cssDimToNumber(element.style.left), StringUtil.cssDimToNumber(element.style.top)];

            if (parent?.className == "main_window") {
                offset[0] = -processedWidth / 2;
                offset[1] = -processedHeight / 2;
            }

            const ui_scaler = config.magicNumbers.UI_SCALAR as number;

            const bindings = GeneralUtil.tryParseBindings(collectionPanelClass.bindings) ?? [];

            const jsonUIElement: JsonUISimpleElement = {
                offset: [offset[0] * ui_scaler, offset[1] * ui_scaler],
                size: [processedWidth * ui_scaler, processedHeight * ui_scaler],
                layer: Number(element.style.zIndex),
                type: "collection_panel",
                anchor_from: "top_left",
                anchor_to: "top_left",
                collection_name: collectionName,

                bindings: bindings,
            };

            const instructions: TreeInstructions = {
                ContinuePath: true,
            };

            return { element: jsonUIElement, instructions: instructions };
        },
    ],
    [
        "draggable-canvas",
        (element: HTMLElement, nameSpace: string) => {
            const parent = element.parentElement!;
            const processedWidth = StringUtil.cssDimToNumber(element.style.width);
            const processedHeight = StringUtil.cssDimToNumber(element.style.height);

            const canvasClass = GeneralUtil.elementToClassElement(element) as DraggableCanvas;

            const offset: [number, number] = [StringUtil.cssDimToNumber(element.style.left), StringUtil.cssDimToNumber(element.style.top)];

            if (parent?.className == "main_window") {
                offset[0] = -processedWidth / 2;
                offset[1] = -processedHeight / 2;
            }

            const ui_scaler = config.magicNumbers.UI_SCALAR as number;

            const bindings = GeneralUtil.tryParseBindings(canvasClass.bindings) ?? [];

            const jsonUIElement: JsonUISimpleElement = {
                offset: [offset[0] * ui_scaler, offset[1] * ui_scaler],
                size: [processedWidth * ui_scaler, processedHeight * ui_scaler],
                layer: Number(element.style.zIndex),
                type: "image",
                texture: `textures/ui/${element.dataset.imageName!}`,
                anchor_from: "top_left",
                anchor_to: "top_left",

                bindings: bindings,
            };

            const instructions: TreeInstructions = {
                ContinuePath: true,
            };

            return { element: jsonUIElement, instructions: instructions };
        },
    ],
    [
        "draggable-button",
        (element: HTMLElement, nameSpace: string) => {
            const parent = element.parentElement!;
            const processedWidth = StringUtil.cssDimToNumber(element.style.width);
            const processedHeight = StringUtil.cssDimToNumber(element.style.height);

            const fileToTex = (fileName: string): string => {
                return `textures/ui/${fileName}`;
            };

            const defaultTex = fileToTex(element.dataset.defaultImageName!);
            const hoverTex = fileToTex(element.dataset.hoverImageName!);
            const pressedTex = fileToTex(element.dataset.pressedImageName!);

            const collectionIndex: number = Number(element.dataset.collectionIndex!);

            const offset: [number, number] = [StringUtil.cssDimToNumber(element.style.left), StringUtil.cssDimToNumber(element.style.top)];

            if (parent?.className == "main_window") {
                offset[0] = -processedWidth / 2;
                offset[1] = -processedHeight / 2;
            }

            const buttonClass = GeneralUtil.elementToClassElement(element) as DraggableButton;

            console.log("buttonClass", buttonClass);

            const buttonIdToDisplayCanvasJsonUi = (): JsonUISimpleElement | undefined => {
                const displayCanvas: DraggableCanvas = buttonClass.displayCanvas!;

                if (!displayCanvas) return undefined;

                const transformationFunc = classToJsonUI.get("draggable-canvas");
                if (!transformationFunc) return undefined;

                const result = transformationFunc(displayCanvas.canvasHolder!, nameSpace);
                if (!result) return undefined;

                return result.element!;
            };

            const buttonIdToDisplayTextJsonUi = (): JsonUISimpleElement | undefined => {
                const displayText: DraggableLabel = buttonClass.displayText!;

                if (!displayText) return undefined;

                const transformationFunc = classToJsonUI.get("draggable-label");
                if (!transformationFunc) return undefined;

                const result = transformationFunc(displayText.label!, nameSpace);
                if (!result) return undefined;

                return result.element!;
            };

            const DisplayElementJsonUi: JsonUISimpleElement | undefined = buttonIdToDisplayCanvasJsonUi()!;
            const TextElementJsonUi: JsonUISimpleElement | undefined = buttonIdToDisplayTextJsonUi()!;

            const ui_scaler = config.magicNumbers.UI_SCALAR as number;

            const bindings = GeneralUtil.tryParseBindings(buttonClass.bindings) ?? [];

            const jsonUIElement: JsonUISimpleElement = {
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

            const instructions: TreeInstructions = {
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
        (element: HTMLElement, nameSpace: string) => {
            const parent = element.parentElement!;
            const classElement = GeneralUtil.elementToClassElement(element) as DraggableLabel;

            const processedWidth = StringUtil.cssDimToNumber(element.style.width);
            const processedHeight = StringUtil.cssDimToNumber(element.style.height);

            const offset: [number, number] = [StringUtil.cssDimToNumber(element.style.left), StringUtil.cssDimToNumber(element.style.top)];

            if (parent?.className == "main_window") {
                offset[0] = -processedWidth / 2;
                offset[1] = -processedHeight / 2;
            }

            const ui_scaler = config.magicNumbers.UI_SCALAR as number;
            const getFontScaledOffsetY = config.magicNumbers.getFontScaledOffsetY as Function;

            const bindings = GeneralUtil.tryParseBindings(classElement.bindings) ?? [];

            const jsonUIElement: JsonUISimpleElement = {
                offset: [
                    (offset[0] + (config.magicNumbers.fontOffsetX as number)) * ui_scaler,
                    (offset[1] + (config.magicNumbers.fontOffsetY as number)) * ui_scaler + getFontScaledOffsetY(parseFloat(element.style.fontSize), element.style.fontFamily ?? "MinecraftRegular"),
                ],
                layer: Number(element.style.zIndex),
                type: "label",
                anchor_from: "top_left",
                anchor_to: "top_left",
                text: (element as HTMLTextAreaElement).value!,
                font_scale_factor: parseFloat(element.style.fontSize) * (config.magicNumbers.fontScalar as number) * ui_scaler,
                text_alignment: element.style.textAlign ?? "left",
                font_type: element.style.fontFamily ?? "MinecraftRegular",
                shadow: classElement.hasShadow,

                bindings: bindings,
            };

            const instructions: TreeInstructions = {
                ContinuePath: false,
            };

            return { element: jsonUIElement, instructions: instructions };
        },
    ],
    [
        "draggable-scrolling_panel",
        (element: HTMLElement, nameSpace: string) => {
            // Has the position of the panel as the panel is strictly used for scrolling
            // and cant have positional properties
            const basePanel = element.parentElement!;
            const parent = basePanel?.parentElement!;

            const elementClass = GeneralUtil.elementToClassElement(element) as DraggableScrollingPanel;

            const processedWidth = StringUtil.cssDimToNumber(basePanel.style.width);
            const processedHeight = StringUtil.cssDimToNumber(basePanel.style.height);

            const offset: [number, number] = [StringUtil.cssDimToNumber(basePanel.style.left), StringUtil.cssDimToNumber(basePanel.style.top)];

            if (parent?.className == "main_window") {
                offset[0] = -processedWidth / 2;
                offset[1] = -processedHeight / 2;
            }

            const ui_scaler = config.magicNumbers.UI_SCALAR as number;

            const jsonUIElement: JsonUISimpleElement = {
                offset: [offset[0] * ui_scaler, offset[1] * ui_scaler],
                size: [processedWidth * ui_scaler, processedHeight * ui_scaler],
                layer: Number(element.style.zIndex),
                type: "panel",
                anchor_from: "top_left",
                anchor_to: "top_left",
                $scroll_size: [10 * ui_scaler, processedHeight * ui_scaler],
                $scrolling_pane_size: [processedWidth * ui_scaler, processedHeight * ui_scaler],
                $scrolling_pane_offset: [0, 0],
                $scroll_bar_right_padding_size: [0, 0],
            };

            const newTreeLink: string = `${nameSpace}.${StringUtil.generateRandomString(8)}-skip`;

            const instructions: TreeInstructions = {
                ContinuePath: true,
                NewTree: {
                    link: newTreeLink,
                    startingNode: "basicPanelScrollingContent",
                },
            };

            const bindings = GeneralUtil.tryParseBindings(elementClass.bindings) ?? [];

            const structure: JsonUISimpleElement = {
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


export const classToTagName: Map<string, string> = new Map([
    ["draggable-panel", "panel"],
    ["draggable-canvas", "image"],
    ["draggable-button", "button"],
    ["draggable-collection_panel", "collection_panel"],
    ["draggable-label", "label"],
    ["draggable-scrolling_panel", "scrolling_panel"],
]);

