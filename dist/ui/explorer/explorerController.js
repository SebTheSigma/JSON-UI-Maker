import { config } from "../../CONFIG.js";
import { selectedElement } from "../../index.js";
import { GeneralUtil } from "../../util/generalUtil.js";
import { classToTagName } from "../../converterTypes/HTMLClassToJonUITypes.js";
import { StringUtil } from "../../util/stringUtil.js";
const textElementIdMap = new Map();
const explorerBaseElement = document.getElementById("explorer");
export class ExplorerController {
    static constructTextElement(text, hasChildren) {
        const div = document.createElement("div");
        div.classList.add("explorerDiv");
        const textDiv = document.createElement("div");
        textDiv.classList.add("explorerText");
        textDiv.textContent = text;
        const hideImg = document.createElement("img");
        hideImg.src = "icons/visible.webp";
        hideImg.classList.add("explorerVisibilityToggle");
        if (hasChildren) {
            const arrowDiv = document.createElement("img");
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
        if (!config.rootElement)
            return;
        console.log("updateExplorer");
        ExplorerController.reset();
        textElementIdMap.clear();
        const rootClassElement = GeneralUtil.elementToClassElement(config.rootElement);
        console.log(rootClassElement);
        ExplorerController.tree(rootClassElement, explorerBaseElement);
        ExplorerController.selectedElementUpdate();
    }
    static reset() {
        const explorer = explorerBaseElement;
        explorer.innerHTML = "";
    }
    static tree(classElement, lastTextElement, depth = 0) {
        console.log("Explorer Tree", depth, typeof classElement);
        const mainElement = classElement.getMainHTMLElement();
        const isRootClassElement = mainElement.dataset.id == config.rootElement?.dataset.id;
        const childrenHTML = Array.from(mainElement.children);
        const filteredChildrenHTML = [];
        for (const child of childrenHTML) {
            // Skips to nect element is needed
            const target = child.dataset.skip === "true" ? child.firstChild : child;
            // Adds the element to the filteredChildrenHTML
            if (target && target.dataset.id)
                filteredChildrenHTML.push(target);
        }
        console.log(filteredChildrenHTML);
        const type = classToTagName.get(mainElement.classList[0]);
        // example: hello_person to Hello Person
        const formattedType = type.replace(/^([a-z])/, (_, c) => c.toUpperCase()).replace(/_([a-z])/g, (_, c) => " " + c.toUpperCase());
        const textElement = ExplorerController.constructTextElement(formattedType, filteredChildrenHTML.length > 0);
        const textArrowElement = textElement.querySelector(".explorerArrow") ?? undefined;
        const textLabelElement = textElement.querySelector(".explorerText") ?? undefined;
        const textVisibilityToggleElement = textElement.querySelector(".explorerVisibilityToggle") ?? undefined;
        if (textVisibilityToggleElement) {
            textVisibilityToggleElement.onclick = (e) => {
                e.stopPropagation();
                e.preventDefault();
                if (textVisibilityToggleElement.src.endsWith("icons/visible.webp")) {
                    textVisibilityToggleElement.src = "icons/hidden.webp";
                    classElement.hide();
                }
                else {
                    textVisibilityToggleElement.src = "icons/visible.webp";
                    classElement.show();
                }
            };
        }
        // If the element has children, therefore is a folder
        if (textArrowElement) {
            textElement.style.left = `${config.magicNumbers.explorer.folderIndentation}px`;
            // Button logic
            textArrowElement.onclick = (e) => {
                e.stopPropagation();
                e.preventDefault();
                textArrowElement.src = textArrowElement.src.endsWith("assets/arrow_down.webp") ? "assets/arrow_right.webp" : "assets/arrow_down.webp";
                // Toggles the visibility of the children
                for (const child of Array.from(textElement.children)) {
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
            const lockedImg = document.createElement("img");
            lockedImg.src = "icons/locked.webp";
            lockedImg.classList.add("explorerLocked");
            textElement.appendChild(lockedImg);
        }
        // Allow selection for everything else
        else if (textLabelElement) {
            // Selection logic
            textLabelElement.ondblclick = (e) => {
                e.stopPropagation();
                e.preventDefault();
                classElement.select(e);
                ExplorerController.selectedElementUpdate();
            };
        }
        lastTextElement.appendChild(textElement);
        textElementIdMap.set(mainElement.dataset.id, textElement);
        // Recursive logic
        for (const childHTML of filteredChildrenHTML) {
            const child = GeneralUtil.elementToClassElement(childHTML);
            ExplorerController.tree(child, textElement, depth + 1);
        }
    }
    static selectedElementUpdate() {
        const selectedExplorerElement = explorerBaseElement.querySelector(".selected");
        if (selectedExplorerElement) {
            selectedExplorerElement.classList.remove("selected");
        }
        if (!selectedElement)
            return;
        const nextSelectedExplorerElement = textElementIdMap.get(selectedElement.dataset.id);
        console.log(GeneralUtil.elementToClassElement(selectedElement));
        if (nextSelectedExplorerElement) {
            const textElement = Array.from(nextSelectedExplorerElement.children).filter((child) => child.classList.contains("explorerText"))[0];
            textElement.classList.add("selected");
            // Unfolds the element
            let parentElement = nextSelectedExplorerElement;
            while (parentElement?.className !== "explorer") {
                const siblings = Array.from(parentElement.parentElement.children);
                for (const child of siblings) {
                    console.log(child, 50);
                    if (child.classList.contains("explorerDiv")) {
                        child.style.display = "block";
                        const childTextArrowElement = Array.from(parentElement.children).filter((child) => child.classList.contains("explorerArrow"))[0];
                        if (!childTextArrowElement)
                            continue;
                        childTextArrowElement.src = "assets/arrow_down.webp";
                    }
                }
                parentElement = parentElement.parentElement;
            }
        }
    }
}
//# sourceMappingURL=explorerController.js.map