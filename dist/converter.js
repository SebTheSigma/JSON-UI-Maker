import { config } from "./CONFIG.js";
import { classToJsonUI } from "./converterTypes/HTMLClassToJonUITypes.js";
import { JSON_TYPES } from "./converterTypes/jsonUITypes.js";
import { StringUtil } from "./util/stringUtil.js";
export class Converter {
    /**
     * Gets all of the nodes currently in the main window
     * @returns An array of all the nodes in the main window
     */
    static getAllNodes() {
        const container = document.getElementById("main_window");
        const children = container.children;
        return Array.from(children);
    }
    /**
     * Goes down the tree of nodes to develop the json-ui file
     * @param startNodeTree The node to start generating the json-ui from
     * @returns A JSON object with the json-ui
     */
    static nodeToJsonUI(node, nameSpace) {
        try {
            let treeData = {};
            if (node?.dataset?.shouldParse == 'false')
                return treeData;
            const getTreeData = classToJsonUI.get(node.className);
            if (getTreeData) {
                treeData = getTreeData(node, nameSpace);
            }
            return treeData;
        }
        catch (e) {
            console.warn(`Error converting node to json-ui: ${e}`);
            return undefined;
        }
    }
    /**
     * Goes down the tree of nodes to develop the json-ui file
     * @param startNodeTree The node to start generating the json-ui from
     * @returns A JSON object with the json-ui
     */
    static tree(startNodeTree, depth = 0, baseNode, nameSpace = config.nameSpace) {
        // Goes down the tree of nodes to develop the json-ui file
        let jsonNodes = {};
        if (depth == 0) {
            jsonNodes = { namespace: nameSpace, custom_button: JSON_TYPES.get("buttonWithHoverText") };
        }
        else {
            jsonNodes = {};
        }
        for (let node of Array.from(startNodeTree.childNodes)) {
            const treeData = Converter.nodeToJsonUI(node, nameSpace);
            // Checks if the node should be ignored
            if (!treeData.instructions)
                continue;
            const jsonUI = treeData.element;
            // Recursively goes down the tree
            const nextNodes = Converter.tree(node, depth + 1, baseNode);
            if (treeData.instructions.ContinuePath) {
                // Adds the JSON-UI controls
                jsonUI.controls = [];
                // Adds the nodes to the jsonUI
                for (let nextNode of Object.keys(nextNodes)) {
                    jsonUI.controls.push({ [nextNode]: nextNodes[nextNode] });
                }
            }
            const randomString = StringUtil.generateRandomString(8);
            const link = treeData.instructions?.CommonElementLink ?? "";
            // Adds the node to the jsonUI
            if (jsonUI)
                jsonNodes[depth == 0 ? `${nameSpace}${link}` : `${randomString}${link}`] = jsonUI;
        }
        return jsonNodes;
    }
    /**
     * Recursively traverses the tree of nodes to generate the json-ui structure.
     * @param node The starting node for generating the json-ui structure.
     * @param depth The current depth of the node in the tree, defaults to 0.
     * @returns A JSON object representing the json-ui structure.
     */
    static test(node, depth = 0) {
        return Converter.tree(node, depth, node);
    }
}
//# sourceMappingURL=converter.js.map