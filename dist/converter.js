class StringUtil {
    /**
     * Converts a string representing a css dimension into a number.
     * @example "100px" => 100
     * @param {string} value
     * @returns {number}
     */
    static cssDimToNumber(value) {
        return Number(value.replace("px", ""));
    }
}
const typeToChnageFunc = new Map([
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
    ]
]);
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
            const tranformationFunc = typeToChnageFunc.get(node.className);
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
    static test(startNodeTree, depth = 0, nameSpace = "main") {
        // Goes down the tree of nodes to develop the json-ui file
        let jsonNodes = {};
        if (depth == 0) {
            jsonNodes = { "namespace": nameSpace };
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