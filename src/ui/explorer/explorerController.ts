import { config } from "../../CONFIG.js";
import { GlobalElementMapValue, selectedElement } from "../../index.js";
import { GeneralUtil } from "../../util/generalUtil.js";
import { classToTagName } from "../../converterTypes/HTMLClassToJonUITypes.js";
import { StringUtil } from "../../util/stringUtil.js";

const textElementIdMap: Map<string, HTMLDivElement> = new Map<string, HTMLDivElement>();
const explorerBaseElement = document.getElementById("explorer")!;

export class ExplorerController {
    static constructTextElement(text: string, hasChildren: boolean): HTMLDivElement {
        const div = document.createElement("div");
        div.classList.add("explorerDiv");

        const textDiv = document.createElement("div");
        textDiv.classList.add("explorerText");
        textDiv.textContent = text;

        const hideImg = document.createElement("img") as HTMLImageElement;
        hideImg.src = "icons/visible.webp";
        hideImg.classList.add("explorerVisibilityToggle");

        if (hasChildren) {
            const arrowDiv = document.createElement("img") as HTMLImageElement;
            arrowDiv.src = "assets/arrow_down.webp";
            arrowDiv.classList.add("explorerArrow");
            arrowDiv.style.marginLeft = "5px";
            div.appendChild(arrowDiv);
        }

        div.appendChild(textDiv);
        div.appendChild(hideImg);
        return div;
    }

    static updateExplorer() {
        if (!config.rootElement) return;
        console.log("updateExplorer");

        ExplorerController.reset();
        textElementIdMap.clear();

        const rootClassElement = GeneralUtil.elementToClassElement(config.rootElement!)!;
        console.log(rootClassElement);
        ExplorerController.tree(rootClassElement, explorerBaseElement as HTMLDivElement);

        ExplorerController.selectedElementUpdate();
    }

    static reset(): void {
        const explorer: HTMLElement = explorerBaseElement;

        explorer.innerHTML = "";
    }

    static tree(classElement: GlobalElementMapValue, lastTextElement: HTMLDivElement, depth: number = 0): void {
        console.log("Explorer Tree", depth, typeof classElement);

        const mainElement = classElement.getMainHTMLElement();

        const isRootClassElement = mainElement.dataset.id == config.rootElement?.dataset.id;

        const childrenHTML = Array.from(mainElement.children) as HTMLElement[];

        const filteredChildrenHTML: HTMLElement[] = [];

        for (const child of childrenHTML) {
            // Skips to nect element is needed
            const target = child.dataset.skip === "true" ? (child.firstChild as HTMLElement | null) : child;

            // Adds the element to the filteredChildrenHTML
            if (target && target.dataset.id) filteredChildrenHTML.push(target);
        }

        console.log(filteredChildrenHTML);

        const type: string = classToTagName.get(mainElement.classList[0]!)!;

        // example: hello_person to Hello Person
        const formattedType = type.replace(/^([a-z])/, (_, c) => c.toUpperCase()).replace(/_([a-z])/g, (_, c) => " " + c.toUpperCase());

        const textElement = ExplorerController.constructTextElement(formattedType, filteredChildrenHTML.length > 0);

        const textArrowElement = textElement.querySelector<HTMLImageElement>(".explorerArrow") ?? undefined;
        const textLabelElement = textElement.querySelector<HTMLDivElement>(".explorerText") ?? undefined;
        const textVisibilityToggleElement = textElement.querySelector<HTMLImageElement>(".explorerVisibilityToggle") ?? undefined;

        if (textVisibilityToggleElement) {
            textVisibilityToggleElement.onclick = (e: MouseEvent) => {
                e.stopPropagation();
                e.preventDefault();

                if (textVisibilityToggleElement.src.endsWith("icons/visible.webp")) {
                    textVisibilityToggleElement.src = "icons/hidden.webp";
                    classElement.hide();
                } else {
                    textVisibilityToggleElement.src = "icons/visible.webp";
                    classElement.show();
                }
            };
        }

        // If the element has children, therefore is a folder
        if (textArrowElement) {
            textElement.style.left = `${config.magicNumbers.explorer.folderIndentation}px`;

            // Button logic
            textArrowElement.onclick = (e: MouseEvent) => {
                e.stopPropagation();
                e.preventDefault();

                textArrowElement.src = textArrowElement.src.endsWith("assets/arrow_down.webp") ? "assets/arrow_right.webp" : "assets/arrow_down.webp";

                // Toggles the visibility of the children
                for (const child of Array.from(textElement.children) as HTMLElement[]) {
                    if (child.classList.contains("explorerDiv")) {
                        child.style.display = child.style.display === "none" ? "block" : "none";
                    }
                }
            };
        }

        // If the element has no children, therefore is a file
        else {
            textElement.style.left = `${config.magicNumbers.explorer.nonFolderIndentation}px`;
        }

        // Dont allow selection for the root panel
        if (isRootClassElement) {
            textElement.style.left = `${StringUtil.cssDimToNumber(textElement.style.left) - config.magicNumbers.explorer.overallOffset}px`;

            const lockedImg = document.createElement("img") as HTMLImageElement;
            lockedImg.src = "icons/locked.webp";
            lockedImg.classList.add("explorerLocked");
            textElement.appendChild(lockedImg);
        }

        // Allow selection for everything else
        else if (textLabelElement) {
            // Selection logic
            textLabelElement.ondblclick = (e: MouseEvent) => {
                e.stopPropagation();
                e.preventDefault();

                classElement.select(e);
                ExplorerController.selectedElementUpdate();
            };
        }

        lastTextElement.appendChild(textElement);
        textElementIdMap.set(mainElement.dataset.id!, textElement);

        // Recursive logic
        for (const childHTML of filteredChildrenHTML) {
            const child: GlobalElementMapValue = GeneralUtil.elementToClassElement(childHTML)!;
            ExplorerController.tree(child, textElement, depth + 1);
        }
    }

    static selectedElementUpdate(): void {
        const selectedExplorerElement = explorerBaseElement.querySelector(".selected");
        if (selectedExplorerElement) {
            selectedExplorerElement.classList.remove("selected");
        }

        if (!selectedElement) return;

        const nextSelectedExplorerElement = textElementIdMap.get(selectedElement!.dataset.id!);
        console.log(GeneralUtil.elementToClassElement(selectedElement!));
        if (nextSelectedExplorerElement) {
            const textElement = Array.from(nextSelectedExplorerElement.children).filter((child) =>
                child.classList.contains("explorerText")
            )[0] as HTMLDivElement;

            textElement!.classList.add("selected");

            // Unfolds the element
            let parentElement = nextSelectedExplorerElement as HTMLElement;
            while (parentElement?.className !== "explorer") {
                const siblings = Array.from(parentElement.parentElement!.children) as HTMLElement[];

                for (const child of siblings) {
                    console.log(child, 50);
                    if (child.classList.contains("explorerDiv")) {
                        child.style.display = "block";

                        const childTextArrowElement = Array.from(parentElement.children).filter((child) => child.classList.contains("explorerArrow"))[0] as
                            | HTMLImageElement
                            | undefined;
                        if (!childTextArrowElement) continue;

                        childTextArrowElement.src = "assets/arrow_down.webp";
                    }
                }

                parentElement = parentElement.parentElement!;
            }
        }
    }
}
