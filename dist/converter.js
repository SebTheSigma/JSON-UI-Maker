const keysConversionMap = new Map([
    [
        (element) => element?.style?.zIndex,
        ["layer", (dim) => Number(dim)]
    ],
    [
        (element) => element?.style?.width,
        ["size", (dim) => Number(dim.replace("px", ""))]
    ],
    [
        (element) => element?.style?.height,
        ["size", (dim) => Number(dim.replace("px", ""))]
    ],
    [
        (element) => element?.style?.left,
        ["offset", (dim) => Number(dim.replace("px", ""))]
    ],
    [
        (element) => element?.style?.top,
        ["offset", (dim) => Number(dim.replace("px", ""))]
    ],
    [
        (element) => element?.className,
        ["type", (dim) => classNameToTypeMap.get(dim)]
    ],
    [
        (element) => element?.imageName,
        ["type", (dim) => classNameToTypeMap.get(dim)]
    ],
]);
const classNameToTypeMap = new Map([
    [
        "draggable-panel",
        "panel"
    ],
    [
        "draggable-canvas",
        "image"
    ]
]);
export class Converter {
    static getAllNodes() {
        const container = document.getElementById("main_window");
        const children = container.children;
        return Array.from(children);
    }
    static nodeToJsonUI(node) {
        const keys = keysConversionMap.keys();
        const jsonUI = {};
        for (let key of keys) {
            let value = key(node);
            if (value) {
                const jsonUIData = keysConversionMap.get(key);
                // Format the value
                const formatFunc = jsonUIData[1];
                value = formatFunc(value);
                if (!jsonUIData)
                    continue;
                // Update the jsonUI
                const oldProperty = jsonUI[jsonUIData[0]];
                if (oldProperty) {
                    value = [oldProperty, value];
                }
                jsonUI[jsonUIData[0]] = value;
            }
        }
        return jsonUI;
    }
    static test(startNodeTree) {
        // Goes down the tree of nodes to develop the json-ui file
        const jsonNodes = {};
        for (let node of Array.from(startNodeTree.childNodes)) {
            const jsonUI = Converter.nodeToJsonUI(node);
            if (!jsonUI.type)
                continue;
            // Recursively goes down the tree
            const nextNodes = Converter.test(node);
            // Adds the JSON-UI controls
            jsonUI["controls"] = [];
            // Adds the nodes to the jsonUI
            for (let nextNode of Object.keys(nextNodes)) {
                jsonUI.controls.push({ [nextNode]: nextNodes[nextNode] });
            }
            // Adds the node to the jsonUI
            if (jsonUI)
                jsonNodes[Converter.generateRandomString(8)] = jsonUI;
        }
        return jsonNodes;
    }
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