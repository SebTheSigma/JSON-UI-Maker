import { selectedElement } from "..";

export function initProperties(): void {
    const properties: HTMLElement = document.getElementById("properties")!;

    let changingNode: Node | undefined;

    for (let node of Array.from(properties.childNodes)) {
        if (node instanceof HTMLInputElement) {
            node.addEventListener("input", function () {
                // Makes sure there is a selected element
                if (selectedElement) {
                    changingNode = node;

                    // Assigns the typed value the the style value
                    selectedElement.style[node.id.replace("properties_", "") as any] = node.value;
                }
            });

            // Resets the changingNode when the user leaves the text box
            node.addEventListener("blur", function () {
                // Makes sure there is a selected element
                if (selectedElement) {
                    changingNode = undefined;
                }
            });
        }
    }

    // Keeps the values of the selected element synced with the text box values
    setInterval(() => {
        for (let node of Array.from(properties.childNodes)) {
            if (node instanceof HTMLInputElement) {
                if (changingNode == node) continue;
                try {
                    node.value = (selectedElement?.style[node.id.replace("properties_", "") as keyof CSSStyleDeclaration] as string | undefined) ?? "None";
                } catch {
                    node.value = "None";
                }
            }
        }
    }, 50);
}