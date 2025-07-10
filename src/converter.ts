interface CanvasWithImageName extends HTMLCanvasElement {
    imageName: string;
}

const keysConversionMap: Map<(element: any) => any, [string, (dim: string) => any]> = new Map([
    [
        (element: HTMLElement) => element?.style?.zIndex,
        ["layer", (dim) => Number(dim)]
    ],
    [
        (element: HTMLElement) => element?.style?.width,
        ["size", (dim) => Number(dim.replace("px", ""))]
    ],
    [
        (element: HTMLElement) => element?.style?.height,
        ["size", (dim) => Number(dim.replace("px", ""))]
    ],
    [
        (element: HTMLElement) => element?.style?.left,
        ["offset", (dim) => Number(dim.replace("px", ""))]
    ],
    [
        (element: HTMLElement) => element?.style?.top,
        ["offset", (dim) => Number(dim.replace("px", ""))]
    ],
    [
        (element: HTMLElement) => element?.className,
        ["type", (dim) => classNameToTypeMap.get(dim)!]
    ],
    [
        (element: CanvasWithImageName) => element?.imageName,
        ["texture", (dim) => `textures/ui/${dim}.png`]
    ],
]);

const classNameToTypeMap: Map<string, string> = new Map([
    [
        "draggable-panel",
        "panel"
    ],
    [
        "draggable-canvas",
        "image"
    ]
])


export class Converter {
    public static getAllNodes(): Node[] {
        const container = document.getElementById("main_window")!;
        const children = container.children;
        return Array.from(children);
    }

    public static nodeToJsonUI(node: HTMLElement): object {
        const keys = keysConversionMap.keys();

        const jsonUI: { [key: string]: string } = {};
        for (let key of keys) {
            let value = key(node);

            if (value) {
                const jsonUIData: [string, (dim: string) => string] = keysConversionMap.get(key)!;

                // Format the value
                const formatFunc = jsonUIData[1];
                value = formatFunc(value);
                if (!jsonUIData) continue;

                // Update the jsonUI
                const oldProperty = jsonUI[jsonUIData[0] as string];
                if (oldProperty) {
                    value = [oldProperty, value];
                }

                jsonUI[jsonUIData[0] as any] = value;
            }
        }

        return jsonUI;
    }

    public static test(startNodeTree: Node): StringObjectMap {
        
        // Goes down the tree of nodes to develop the json-ui file
        const jsonNodes: StringObjectMap = {};
        for (let node of Array.from(startNodeTree.childNodes)) {
            const jsonUI: any = Converter.nodeToJsonUI(node as HTMLElement);
            if (!jsonUI.type) continue;

            // Recursively goes down the tree
            const nextNodes: StringObjectMap = Converter.test(node);

            // Adds the JSON-UI controls
            jsonUI["controls"] = [];

            // Adds the nodes to the jsonUI
            for (let nextNode of Object.keys(nextNodes)) {
                jsonUI.controls.push({ [nextNode]: nextNodes[nextNode] });
            }


            // Adds the node to the jsonUI
            if (jsonUI) jsonNodes[Converter.generateRandomString(8)] = jsonUI;
        }

        return jsonNodes;
    }

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


interface StringObjectMap {
    [key: string]: object;
}
