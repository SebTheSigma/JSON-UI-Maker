

const keysConversionMap = new Map([
    ["z-index", "layer"],

    // Width needs to be before height
    ["width", "size"],
    ["height", "size"],

    ["left", "left"],
    ["top", "top"]
]);

export class Converter {
    public static getAllNodes(): Node[] {
        const container = document.getElementById("main_window")!
        const children = container.children;
        return Array.from(children);
    }

    public static nodeToJsonUI(node: HTMLElement): object {
        const keys = keysConversionMap.keys();

        const jsonUI: { [key: string]: string } = {};
        for (let key of keys) {
            let value = node?.style?.[key as any];
            if (value) {
                const jsonUIKey: string = keysConversionMap.get(key)!;
                if (!jsonUIKey) continue;

                const oldProperty = jsonUI[jsonUIKey];
                if (oldProperty) {
                    value = `[${[oldProperty, value].join(", ")}]`;
                }
                jsonUI[jsonUIKey as any] = value;
            }
        }

        return jsonUI;
    }

    public static test(startNodeTree: Node): object[] {

        const jsonNodes: object[] = [];
        for (let node of Array.from(startNodeTree.childNodes)) {
            const jsonUI: any = Converter.nodeToJsonUI(node as HTMLElement);
            console.log(jsonUI)
            if (!jsonUI.size) continue;

            if (jsonUI) jsonNodes.push(jsonUI);

            const nextNodes: object[] = Converter.test(node);
            console.log(nextNodes)
            if (nextNodes.length == 0) jsonNodes.push(nextNodes);
        }

        return jsonNodes;
    }
}