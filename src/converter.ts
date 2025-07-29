import { config } from "./CONFIG.js";
import { classToJsonUI, JsonUISimpleElement } from "./converterTypes/HTMLClassToJonUITypes.js";
import { JSON_TYPES } from "./converterTypes/jsonUITypes.js";
import { StringUtil } from "./util/stringUtil.js";

export interface TreeInstructions {
    ContinuePath: boolean;
    CommonElementLink?: string;
    NewTreeFromBaseNode?: string;
    rootStarterElement?: string;
}

export interface TreeData {
    element?: JsonUISimpleElement;
    instructions?: TreeInstructions;
}

interface StringObjectMap {
    [key: string]: object | string;
}

export class Converter {
    /**
     * Gets all of the nodes currently in the main window
     * @returns An array of all the nodes in the main window
     */
    public static getAllNodes(): Node[] {
        const container: HTMLElement = document.getElementById("main_window")!;
        const children: HTMLCollection = container.children;
        return Array.from(children);
    }

    /**
     * Goes down the tree of nodes to develop the json-ui file
     * @param startNodeTree The node to start generating the json-ui from
     * @returns A JSON object with the json-ui
     */
    public static nodeToJsonUI(node: HTMLElement, nameSpace: string): TreeData | undefined {
        try {
            let treeData: TreeData = {};
            if (node?.dataset?.shouldParse == "false") return treeData;

            const getTreeData: (element: HTMLElement, nameSpace: string) => TreeData = classToJsonUI.get(node.className)!;

            if (getTreeData) {
                treeData = getTreeData(node, nameSpace);
            }

            return treeData;
        } catch (e) {
            console.warn(`Error converting node to json-ui: ${e}`);
            return undefined;
        }
    }

    /**
     * Goes down the tree of nodes to develop the json-ui file
     * @param startNodeTree The node to start generating the json-ui from
     * @returns A JSON object with the json-ui
     */
    public static tree(
        startNodeTree: Node,
        depth: number = 0,
        nameSpace: string = config.nameSpace,
        _baseJsonUiNode?: JsonUISimpleElement,
        _nodeLink?: string
    ): StringObjectMap {
        // Goes down the tree of nodes to develop the json-ui file
        let jsonNodes: StringObjectMap = {};
        if (depth == 0) {
            jsonNodes = { namespace: nameSpace, custom_button: JSON_TYPES.get("buttonWithHoverText")! };
            _baseJsonUiNode = jsonNodes;
        } else {
            jsonNodes = {};
        }

        for (let node of Array.from(startNodeTree.childNodes)) {
            const treeData: TreeData = Converter.nodeToJsonUI(node as HTMLElement, nameSpace)!;
            console.log('depth: ', depth, treeData);

            // Checks if the node should be ignored
            if (!treeData.instructions) continue;

            // Makes the new tree if needed
            if (treeData.instructions.NewTreeFromBaseNode && treeData.instructions.rootStarterElement) {
                jsonNodes[StringUtil.generateRandomString(8)] = treeData.element!;
                const panel: JsonUISimpleElement = JSON_TYPES.get(treeData.instructions.rootStarterElement)!;

                // Links the element to the panel which starts a new tree
                const newTreeLink: string = treeData.instructions.NewTreeFromBaseNode.split(".")[1]!;

                const nextNodes: StringObjectMap = Converter.tree(node, depth + 1, nameSpace, _baseJsonUiNode);

                if (treeData.instructions!.ContinuePath) {
                    // Adds the JSON-UI controls
                    panel.controls = [];

                    // Adds the nodes to the jsonUI
                    for (let nextNode of Object.keys(nextNodes)) {
                        panel.controls.push({ [nextNode]: nextNodes[nextNode] });
                    }
                }

                console.log(`New tree from base node: ${newTreeLink}`, _baseJsonUiNode!);

                // Adds the node to the jsonUI
                if (_baseJsonUiNode) _baseJsonUiNode[newTreeLink] = panel;


            } else {
                const jsonUI: JsonUISimpleElement = treeData.element!;

                // Recursively goes down the tree
                const nextNodes: StringObjectMap = Converter.tree(node, depth + 1, nameSpace, _baseJsonUiNode);

                if (treeData.instructions!.ContinuePath) {
                    // Adds the JSON-UI controls
                    jsonUI.controls = [];

                    // Adds the nodes to the jsonUI
                    for (let nextNode of Object.keys(nextNodes)) {
                        jsonUI.controls.push({ [nextNode]: nextNodes[nextNode] });
                    }
                }

                const randomString: string = StringUtil.generateRandomString(8);
                const link = treeData.instructions?.CommonElementLink ?? "";

                // Adds the node to the jsonUI
                if (jsonUI) jsonNodes[depth == 0 ? `${nameSpace}${link}` : `${randomString}${link}`] = jsonUI;
            }
        }

        return jsonNodes;
    }

    /**
     * Recursively traverses the tree of nodes to generate the json-ui structure.
     * @param node The starting node for generating the json-ui structure.
     * @param depth The current depth of the node in the tree, defaults to 0.
     * @returns A JSON object representing the json-ui structure.
     */

    public static test(node: Node, depth: number = 0): StringObjectMap {
        return Converter.tree(node, depth);
    }
}

