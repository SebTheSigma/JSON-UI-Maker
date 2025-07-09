const keysConversionMap = new Map([
    ["z-index", "layer"],
    // Width needs to be before height
    ["width", "size"],
    ["height", "size"],
    ["left", "left"],
    ["top", "top"]
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
            let value = node?.style?.[key];
            if (value) {
                const jsonUIKey = keysConversionMap.get(key);
                if (!jsonUIKey)
                    continue;
                const oldProperty = jsonUI[jsonUIKey];
                if (oldProperty) {
                    value = `[${[oldProperty, value].join(", ")}]`;
                }
                jsonUI[jsonUIKey] = value;
            }
        }
        return jsonUI;
    }
    static test(startNodeTree) {
        const jsonNodes = [];
        for (let node of Array.from(startNodeTree.childNodes)) {
            const jsonUI = Converter.nodeToJsonUI(node);
            console.log(jsonUI);
            if (!jsonUI.size)
                continue;
            if (jsonUI)
                jsonNodes.push(jsonUI);
            const nextNodes = Converter.test(node);
            console.log(nextNodes);
            if (nextNodes.length == 0)
                jsonNodes.push(nextNodes);
        }
        return jsonNodes;
    }
}
//# sourceMappingURL=converter.js.map