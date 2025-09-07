import { config } from "./CONFIG.js";
import { SavedConfig, StringObjectMap } from "./converter.js";
import { DraggableCanvas } from "./elements/canvas.js";
import { DraggableCollectionPanel } from "./elements/collectionPanel.js";
import { DraggableLabel } from "./elements/label.js";
import { DraggablePanel } from "./elements/panel.js";
import { DraggableScrollingPanel } from "./elements/scrollingPanel.js";
import { ElementSharedFuncs } from "./elements/sharedElement.js";
import { FileUploader } from "./files/openFiles.js";
import { Builder, GLOBAL_ELEMENT_MAP, GlobalElementMapValue, ImageDataState, images, mainJsonUiPanelElement } from "./index.js";
import { Notification } from "./ui/notifs/noficationMaker.js";
import { GeneralUtil } from "./util/generalUtil.js";
import { StringUtil } from "./util/stringUtil.js";

interface UploadTreeInstructions {
    ContinuePath: boolean;
    SkipToNextJsonNode?: boolean;
    FollowPath?: string;
}

export class FormUploader {

    public static parseJsonWithComments(raw: string) {
      const noComments = raw
        .replace(/\/\/.*$/gm, "")       // remove //
        .replace(/\/\*[\s\S]*?\*\//g, ""); // remove /* */
      return JSON.parse(noComments);
    }

    public static isValid(form: string) {
        try {
            const parsed = FormUploader.parseJsonWithComments(form);
            console.log(parsed)

            if (!parsed.namespace) {
                new Notification("Invalid namespace, please upload a valid form", 5000, "error");
                return false;
            }

            if (!parsed[parsed.namespace]) {
                new Notification("Cant find root element, please upload a valid form", 5000, "error");
                return false;
            }

            return true;
        } catch(e) {
            console.log(3, e);
            
            return false;
        }
    }

    public static getJsonControlsAndType(json: StringObjectMap) {
        const controls = json.controls as ControlNode[] || [];

        const jsonControls: { control: StringObjectMap, type: string }[] = [];
        for (const child of controls) {
            const childKey = Object.keys(child)[0]!;
            const childJson = child[childKey];
            const childType = childKey?.split('-')[1];
            jsonControls.push({ control: childJson!, type: childType! });
        }

        return jsonControls;
    }

    public static uploadForm(form: string) {
        console.log(1);

        if (FormUploader.isValid(form)) {
            console.log(2, form);

            Builder.reset();

            const mainPanel: GlobalElementMapValue = GeneralUtil.elementToClassElement(mainJsonUiPanelElement!)!

            const parsed = FormUploader.parseJsonWithComments(form);
            FormUploader.tree(parsed[parsed.namespace], mainPanel, [parsed['config'], parsed]);

            new Notification("Form uploaded successfully", 2000, "notif");
        }
    }

    public static tree(rootJson: StringObjectMap, parentClassElement: GlobalElementMapValue, args?: any) {

        const controls = FormUploader.getJsonControlsAndType(rootJson);

        for (const { control: childJson, type: childType } of controls) {

            const skip = () => {
                const nextNodeChildren = rootJson.controls as ControlNode[] || [];

                for (const nextNode of nextNodeChildren) {

                    const nextNodeKey = Object.keys(nextNode)[0]!;
                    const nextNodeJson = nextNode[nextNodeKey];

                    FormUploader.tree(nextNodeJson!, parentClassElement, args);
                }
            }

            if (childType == 'skip') {
                console.log('Manual Skip');
                skip();
                continue;
            }

            console.log(childType);

            if (!childType) {
                new Notification('Some elements lack a type', 2000, 'warning');
                continue;
            }

            const createClassElement = tagNameToCreateClassElementFunc.get(childType)!;

            console.warn(args)

            const newParent: { element: GlobalElementMapValue, instructions: UploadTreeInstructions } | undefined = createClassElement(childJson!, parentClassElement, args[0]!, rootJson);

            if (!newParent?.element || !newParent.instructions) {
                new Notification('Error creating element', 5000, 'error');
                continue;
            }

            if (!newParent.instructions.ContinuePath) {
                continue;
            }

            // Skips the next node and goes to its children
            if (newParent.instructions.SkipToNextJsonNode) {
                skip();
                continue;
            }

            if (newParent.instructions.FollowPath) {
                const splitPathString = newParent.instructions.FollowPath.split('.');

                if (splitPathString[0] != args[1]['namespace']) {
                    new Notification('Error following path, namespace error', 5000, 'error');
                    continue;
                }

                const nextNode = args[1][splitPathString[1]!] as StringObjectMap;

                if (!nextNode) {
                    new Notification('Error following path', 5000, 'error');
                    continue;
                }

                FormUploader.tree(nextNode!, newParent.element, args);
                continue;
            }


            FormUploader.tree(childJson!, newParent.element, args);
        }
    }
}

type ControlNode = {
    [key: string]: StringObjectMap;
};


export const tagNameToCreateClassElementFunc: Map<string, (json: StringObjectMap, parentClassElement: GlobalElementMapValue, usedConfig: SavedConfig, nextNodes: StringObjectMap) => { element: GlobalElementMapValue, instructions: UploadTreeInstructions } | undefined> = new Map([
    [
        "panel",
        (json: StringObjectMap, parentClassElement: GlobalElementMapValue, usedConfig: SavedConfig, nextNodes: StringObjectMap): { element: GlobalElementMapValue, instructions: UploadTreeInstructions } | undefined => {
            
            const UI_SCALAR = usedConfig!.magicNumbers!.UI_SCALAR as number;

            const id: string = StringUtil.generateRandomString(15);
            const panel: DraggablePanel = new DraggablePanel(id, parentClassElement.getMainHTMLElement());

            GLOBAL_ELEMENT_MAP.set(id, panel);

            const size = json.size as [number, number];
            const offset = json.offset as [number, number];

            panel.panel.style.width = `${size[0] / UI_SCALAR}px`;
            panel.panel.style.height = `${size[1] / UI_SCALAR}px`;

            ElementSharedFuncs.updateCenterCirclePosition(panel);

            panel.panel.style.left = `${offset[0] / UI_SCALAR}px`;
            panel.panel.style.top = `${offset[1] / UI_SCALAR}px`;

            panel.panel.style.zIndex = `${json.layer}`;

            if ((json.bindings as []).length > 0) panel.bindings = JSON.stringify(json.bindings, null, config.magicNumbers.textEditor.indentation);

            return { element: panel, instructions: { ContinuePath: true } };
        }
    ],
    [
        "label",
        (json: StringObjectMap, parentClassElement: GlobalElementMapValue, usedConfig: SavedConfig, nextNodes: StringObjectMap): { element: GlobalElementMapValue, instructions: UploadTreeInstructions } | undefined => {
            
            const UI_SCALAR = usedConfig!.magicNumbers!.UI_SCALAR as number;

            const id: string = StringUtil.generateRandomString(15);
            const label: DraggableLabel = new DraggableLabel(
                id,
                parentClassElement.getMainHTMLElement(),
                {
                    text: json.text as string,
                    includeTextPrompt: true,
                    fontScale: json.font_scale_factor as number,
                    textAlign: json.text_alignment as "left" | "right" | "center"
                }
            );

            GLOBAL_ELEMENT_MAP.set(id, label);

            const offset = json.offset as [number, number];

            label.label.style.left = `${offset[0] / UI_SCALAR}px`;
            label.label.style.top = `${offset[1] / UI_SCALAR}px`;

            const labelOffset = config.magicNumbers.labelToOffset(label.label);
            label.shadowLabel.style.left = `${
                StringUtil.cssDimToNumber(label.label.style.left) + label.shadowOffsetX + labelOffset[0]
            }px`;
            label.shadowLabel.style.top = `${
                StringUtil.cssDimToNumber(label.label.style.top) + label.shadowOffsetY + labelOffset[1]
            }px`;

            label.shadowLabel.style.fontFamily = json.font_type as string;
            label.mirror.style.fontFamily = json.font_type as string;
            label.label.style.fontFamily = json.font_type as string;

            label.label.style.zIndex = `${json.layer}`;

            if ((json.bindings as []).length > 0) label.bindings = JSON.stringify(json.bindings, null, config.magicNumbers.textEditor.indentation);

            return { element: label, instructions: { ContinuePath: true } };
        }
    ],
    [
        "image",
        (json: StringObjectMap, parentClassElement: GlobalElementMapValue, usedConfig: SavedConfig, nextNodes: StringObjectMap): { element: GlobalElementMapValue, instructions: UploadTreeInstructions } | undefined => {
            
            const UI_SCALAR = usedConfig!.magicNumbers!.UI_SCALAR as number;
            const texturePath = json.texture as string;
            let imageName = texturePath.split('/').pop()!.split('.')[0]! || texturePath;

            if (!FileUploader.isFileUploaded(imageName)) {
                new Notification(`Image ${imageName} not found`, 2000, "warning");
                imageName = "placeholder";
            }

            const imageData: ImageDataState = images.get(imageName)!;

            if (!imageData) {
                new Notification(`Image ${imageName} not found`, 2000, "warning");
                return undefined;
            }

            const id: string = StringUtil.generateRandomString(15);
            const canvas: DraggableCanvas = new DraggableCanvas(id, parentClassElement.getMainHTMLElement(), imageData.png!, imageName, imageData.json);

            GLOBAL_ELEMENT_MAP.set(id, canvas);

            const size = json.size as [number, number];
            const offset = json.offset as [number, number];

            canvas.drawImage(size[0] / UI_SCALAR, size[1] / UI_SCALAR);

            ElementSharedFuncs.updateCenterCirclePosition(canvas);

            canvas.canvasHolder.style.left = `${offset[0] / UI_SCALAR}px`;
            canvas.canvasHolder.style.top = `${offset[1] / UI_SCALAR}px`;

            canvas.canvasHolder.style.zIndex = `${json.layer}`;

            if ((json.bindings as []).length > 0) canvas.bindings = JSON.stringify(json.bindings, null, config.magicNumbers.textEditor.indentation);

            return { element: canvas, instructions: { ContinuePath: true } };
        }
    ],
    [
        "collection_panel",
        (json: StringObjectMap, parentClassElement: GlobalElementMapValue, usedConfig: SavedConfig, nextNodes: StringObjectMap): { element: GlobalElementMapValue, instructions: UploadTreeInstructions } | undefined => {
            
            const UI_SCALAR = usedConfig!.magicNumbers!.UI_SCALAR as number;

            const id: string = StringUtil.generateRandomString(15);
            const collectionPanel: DraggableCollectionPanel = new DraggableCollectionPanel(id, parentClassElement.getMainHTMLElement());

            GLOBAL_ELEMENT_MAP.set(id, collectionPanel);

            const size = json.size as [number, number];
            const offset = json.offset as [number, number];

            if (!json.collection_name) {
                new Notification(`Collection name not found`, 2000, "warning");
            }

            collectionPanel.panel.dataset.collectionName = json.collection_name as string ?? config.defaultCollectionName;

            collectionPanel.panel.style.width = `${size[0] / UI_SCALAR}px`;
            collectionPanel.panel.style.height = `${size[1] / UI_SCALAR}px`;

            ElementSharedFuncs.updateCenterCirclePosition(collectionPanel);

            collectionPanel.panel.style.left = `${offset[0] / UI_SCALAR}px`;
            collectionPanel.panel.style.top = `${offset[1] / UI_SCALAR}px`;

            collectionPanel.panel.style.zIndex = `${json.layer}`;

            if ((json.bindings as []).length > 0) collectionPanel.bindings = JSON.stringify(json.bindings, null, config.magicNumbers.textEditor.indentation);

            return { element: collectionPanel, instructions: { ContinuePath: true } };
        }
    ],
    [
        "scrolling_panel",
        (json: StringObjectMap, parentClassElement: GlobalElementMapValue, usedConfig: SavedConfig, nextNodes: StringObjectMap): { element: GlobalElementMapValue, instructions: UploadTreeInstructions } | undefined => {
            
            const UI_SCALAR = usedConfig!.magicNumbers!.UI_SCALAR as number;

            const id: string = StringUtil.generateRandomString(15);
            const scrollingPanel: DraggableScrollingPanel = new DraggableScrollingPanel(id, parentClassElement.getMainHTMLElement());

            GLOBAL_ELEMENT_MAP.set(id, scrollingPanel);

            // Iterate twice to get to the from the current node to the node ahead
            const controls1 = FormUploader.getJsonControlsAndType(nextNodes!);
            const scrollingLinkerPanel = FormUploader.getJsonControlsAndType(controls1[0]?.control!)[0]?.control!;

            // console.warn(12, nextNodeFirstControl, nextNodeFirstControlKey, nextNodeFirstControlJson, nextNodes);

            const size = json.size as [number, number];
            const offset = scrollingLinkerPanel.$scrolling_pane_offset as [number, number];

            scrollingPanel.panel.style.width = `${size[0] / UI_SCALAR}px`;
            scrollingPanel.panel.style.height = `${size[1] / UI_SCALAR}px`;
            scrollingPanel.basePanel.style.width = scrollingPanel.panel.style.width;
            scrollingPanel.basePanel.style.height = scrollingPanel.panel.style.height;

            scrollingPanel.basePanel.style.left = `${offset[0]! / UI_SCALAR}px`;
            scrollingPanel.basePanel.style.top = `${offset[1]! / UI_SCALAR}px`;

            scrollingPanel.slider.updateHandle();

            scrollingPanel.panel.style.zIndex = `${json.layer}`;

            if ((scrollingLinkerPanel.bindings as []).length > 0) scrollingPanel.bindings = JSON.stringify(scrollingLinkerPanel.bindings, null, config.magicNumbers.textEditor.indentation);

            return { element: scrollingPanel, instructions: { ContinuePath: true, FollowPath: scrollingLinkerPanel.$scrolling_content as string } };
        }
    ]
]);