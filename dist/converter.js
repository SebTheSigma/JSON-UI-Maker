import { classToJsonUI } from "./converterTypes/HTMLClassToJonUITypes.js";
import { JSON_TYPES } from "./converterTypes/jsonUITypes.js";
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
    static nodeToJsonUI(node) {
        try {
            let jsonUI = {};
            const tranformationFunc = classToJsonUI.get(node.className);
            if (tranformationFunc) {
                jsonUI = tranformationFunc(node);
            }
            return jsonUI;
        }
        catch (e) {
            return undefined;
        }
    }
    /**
     * Goes down the tree of nodes to develop the json-ui file
     * @param startNodeTree The node to start generating the json-ui from
     * @returns A JSON object with the json-ui
     */
    static startTree(startNodeTree, depth = 0, nameSpace = "main") {
        // Goes down the tree of nodes to develop the json-ui file
        let jsonNodes = {};
        if (depth == 0) {
            jsonNodes = { "namespace": nameSpace, custom_button: JSON_TYPES.get('buttonWithHoverText') };
        }
        else {
            jsonNodes = {};
        }
        for (let node of Array.from(startNodeTree.childNodes)) {
            const jsonUI = Converter.nodeToJsonUI(node);
            if (!jsonUI.type)
                continue;
            // Recursively goes down the tree
            const nextNodes = Converter.test(node, depth + 1);
            // Adds the JSON-UI controls
            jsonUI["controls"] = [];
            // Adds the nodes to the jsonUI
            for (let nextNode of Object.keys(nextNodes)) {
                jsonUI.controls.push({ [nextNode]: nextNodes[nextNode] });
            }
            // Adds the node to the jsonUI
            if (jsonUI)
                jsonNodes[depth == 0 ? nameSpace : Converter.generateRandomString(8)] = jsonUI;
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
        return Converter.startTree(node, depth);
    }
    /**
     * Generates a random string of a specified length.
     * The string consists of lowercase letters and digits.
     *
     * @param length The desired length of the generated string.
     * @returns A random string of the specified length.
     */
    static generateRandomString(length) {
        let result = "";
        const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
}
//# sourceMappingURL=converter.js.map