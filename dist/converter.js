import { config } from "./CONFIG.js";
import { classToJsonUI, classToTagName } from "./converterTypes/HTMLClassToJonUITypes.js";
import { JSON_TYPES } from "./converterTypes/jsonUITypes.js";
import { Notification } from "./ui/notifs/noficationMaker.js";
import { StringUtil } from "./util/stringUtil.js";
export class Converter {
    /**
     * Goes down the tree of nodes to develop the json-ui file
     * @param startNodeTree The node to start generating the json-ui from
     * @returns A JSON object with the json-ui
     */
    static nodeToJsonUI(node, nameSpace) {
        let treeData = {};
        if (node?.dataset?.shouldParse == "false")
            return treeData;
        const getTreeData = classToJsonUI.get(node.classList?.[0]);
        if (getTreeData) {
            treeData = getTreeData(node, nameSpace);
        }
        return treeData;
    }
    /**
     * Recursively traverses the tree of nodes to generate the json-ui structure.
     * Uses skip and continue attributes to control the flow of the tree.
     * Uses the NewTree and CommonElementLink attributes to control the flow of the tree.
     * Can choose whether to parse the node or not.
     *
     * @param startNodeTree The starting node for generating the json-ui structure.
     * @param depth The current depth of the node in the tree, defaults to 0.
     * @param nameSpace The namespace for the json-ui, defaults to the one specified in the CONFIG.
     * @param _baseJsonUiNode The base node for the json-ui, defaults to an empty node.
     * @param _nodeLink The link to the node, defaults to an empty string.
     * @returns A JSON object representing the json-ui structure.
     */
    static tree(startNodeTree, depth = 0, nameSpace = config.nameSpace, _baseJsonUiNode) {
        // Goes down the tree of nodes to develop the json-ui file
        let jsonNodes = {};
        if (depth == 0) {
            jsonNodes = { namespace: nameSpace, custom_button: JSON_TYPES.get("buttonWithHoverText") };
            _baseJsonUiNode = jsonNodes;
        }
        else {
            jsonNodes = {};
        }
        console.log("startNodeTree", startNodeTree);
        for (let node of Array.from(startNodeTree.childNodes)) {
            // Skips the node and goes to its children
            if (node?.dataset?.skip == "true") {
                const nextNodes = Converter.tree(node, depth + 1, nameSpace, _baseJsonUiNode);
                for (let nextNode of Object.keys(nextNodes)) {
                    jsonNodes[nextNode] = nextNodes[nextNode];
                }
                continue;
            }
            const treeData = Converter.nodeToJsonUI(node, nameSpace);
            // Checks if the node should be ignored
            if (!treeData?.instructions)
                continue;
            if (treeData.instructions.Warning) {
                new Notification(treeData.instructions.Warning.message, 5000, "warning");
            }
            const type = classToTagName.get(node.classList?.[0]);
            // Makes the new tree if needed
            if (treeData.instructions.NewTree) {
                jsonNodes[`${StringUtil.generateRandomString(8)}-${type}`] = treeData.element;
                const panel = JSON_TYPES.get(treeData.instructions.NewTree.startingNode);
                // Links the element to the panel which starts a new tree
                const newTreeLink = treeData.instructions.NewTree.link.split(".")[1];
                const nextNodes = Converter.tree(node, depth + 1, nameSpace, _baseJsonUiNode);
                if (treeData.instructions.ContinuePath) {
                    // Adds the JSON-UI controls
                    panel.controls = [];
                    // Adds the nodes to the jsonUI
                    for (let nextNode of Object.keys(nextNodes)) {
                        panel.controls.push({ [nextNode]: nextNodes[nextNode] });
                    }
                }
                // Adds the node to the jsonUI
                if (_baseJsonUiNode)
                    _baseJsonUiNode[newTreeLink] = panel;
            }
            else {
                const jsonUI = treeData.element;
                // Recursively goes down the tree
                const nextNodes = Converter.tree(node, depth + 1, nameSpace, _baseJsonUiNode);
                if (treeData.instructions.ContinuePath) {
                    // Adds the JSON-UI controls
                    jsonUI.controls = [];
                    // Adds the nodes to the jsonUI
                    for (let nextNode of Object.keys(nextNodes)) {
                        jsonUI.controls.push({ [nextNode]: nextNodes[nextNode] });
                    }
                }
                const randomString = `${StringUtil.generateRandomString(8)}-${type}`;
                const link = treeData.instructions?.CommonElementLink ?? "";
                // Adds the node to the jsonUI
                if (jsonUI)
                    jsonNodes[depth == 0 ? `${nameSpace}${link}` : `${randomString}${link}`] = jsonUI;
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
    static convertToJsonUi(node, depth = 0) {
        const tree = Converter.tree(node, depth);
        tree["config"] = {
            magicNumbers: config.magicNumbers,
        };
        const stringifiedTree = JSON.stringify(tree, null, 2);
        let commentedStringifiedTree = stringifiedTree +
            "\n/* Generated by JSON-UI Maker, do not edit or it cannot be imported back into the website.\nMade by smegma0393 (seb) on discord https://github.com/SebTheSigma/JSON-UI-Maker */";
        return commentedStringifiedTree;
    }
}
//# sourceMappingURL=converter.js.map