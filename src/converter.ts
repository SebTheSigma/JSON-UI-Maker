import { classToJsonUI, JsonUISimpleElement } from "./converterTypes/HTMLClassToJonUITypes.js";
import { JSON_TYPES } from "./converterTypes/jsonUITypes.js";

export interface TreeInstructions {
    ContinuePath: boolean;
    CommonElementLink?: string,
    NewTreeFromBaseNode?: boolean; // Might use later
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
            const getTreeData: ((element: HTMLElement, nameSpace: string) => TreeData) = classToJsonUI.get(node.className)!;

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
    public static tree(startNodeTree: Node, depth: number = 0, baseNode: Node, nameSpace: string = "main"): StringObjectMap {
        
        // Goes down the tree of nodes to develop the json-ui file
        let jsonNodes: StringObjectMap = {};
        if (depth == 0) {
            jsonNodes = { "namespace": nameSpace, custom_button: JSON_TYPES.get('buttonWithHoverText')! };
        }
        else {
            jsonNodes = {};
        }

        for (let node of Array.from(startNodeTree.childNodes)) {
            const treeData: TreeData = Converter.nodeToJsonUI(node as HTMLElement, nameSpace)!;

            // Checks if the node should be ignored
            if (!treeData.instructions) continue;
            if (!treeData.instructions!.ContinuePath) continue;

            const jsonUI: JsonUISimpleElement = treeData.element!;

            // Recursively goes down the tree
            const nextNodes: StringObjectMap = Converter.tree(node, depth + 1, baseNode);

            // Adds the JSON-UI controls
            jsonUI["controls"] = [];

            // Adds the nodes to the jsonUI
            for (let nextNode of Object.keys(nextNodes)) {
                jsonUI.controls.push({ [nextNode]: nextNodes[nextNode] });
            }

            const randomString: string = Converter.generateRandomString(8);
            const link = treeData.instructions?.CommonElementLink ?? '';

            // Adds the node to the jsonUI
            if (jsonUI) jsonNodes[depth == 0 ? `${nameSpace}${link}` : `${randomString}${link}`] = jsonUI;
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
        return Converter.tree(node, depth, node);
    }

    /**
     * Generates a random string of a specified length.
     * The string consists of lowercase letters and digits.
     * 
     * @param length The desired length of the generated string.
     * @returns A random string of the specified length.
     */
    public static generateRandomString(length: number): string {
        let result = "";
        const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
}
