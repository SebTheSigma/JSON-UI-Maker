import { config } from "../../CONFIG.js";
import { GLOBAL_FILE_SYSTEM } from "../../index.js";
const modal = document.getElementById("modalChooseImage");
const closeBtn = document.getElementById("modalChooseImageClose");
const form = document.getElementsByClassName("modalChooseImageForm")[0];
class ChooseImageFileTree {
    static constructTextElement(text, hasChildren, hasNineslice = false) {
        const div = document.createElement("div");
        div.classList.add("explorerDiv");
        const textDiv = document.createElement("div");
        textDiv.classList.add("explorerText");
        textDiv.textContent = text;
        if (hasChildren) {
            const arrowDiv = document.createElement("img");
            arrowDiv.src = "assets/arrow_down.webp";
            arrowDiv.classList.add("explorerArrow");
            arrowDiv.style.marginLeft = "5px";
            div.appendChild(arrowDiv);
        }
        div.appendChild(textDiv);
        if (hasNineslice) {
            const ninesliceImg = document.createElement("img");
            ninesliceImg.src = "icons/nineslice.webp";
            ninesliceImg.classList.add("explorerHasNineslice");
            div.appendChild(ninesliceImg);
        }
        return div;
    }
    static tree(fileStructureCurrentDir, lastTextElement, depth = 0) {
        console.log("Image Dir Tree", depth, fileStructureCurrentDir);
        const nextDirs = Object.keys(fileStructureCurrentDir);
        const acceptedTypes = ["png", "jpg", "jpeg", "webp"];
        for (let nextDir of nextDirs) {
            const hasChildren = Object.keys(fileStructureCurrentDir[nextDir]).length > 0;
            if (hasChildren) {
                const textElement = ChooseImageFileTree.constructTextElement(nextDir, hasChildren);
                textElement.style.left = `${config.magicNumbers.explorer.folderIndentation - (depth === 0 ? 20 : 0)}px`;
                const textArrowElement = textElement.querySelector(".explorerArrow");
                // Button logic
                textArrowElement.onclick = (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    textArrowElement.src = textArrowElement.src.endsWith("assets/arrow_down.webp") ? "assets/arrow_right.webp" : "assets/arrow_down.webp";
                    // Toggles the visibility of the children
                    for (const child of Array.from(textElement.children)) {
                        console.log(child);
                        if (child.classList.contains("explorerDiv")) {
                            console.log(child, 5);
                            child.style.display = child.style.display === "none" ? "block" : "none";
                        }
                    }
                };
                lastTextElement.appendChild(textElement);
                this.tree(fileStructureCurrentDir[nextDir], textElement, depth + 1);
            }
            else {
                const fileType = nextDir.split(".").pop();
                console.log(fileType);
                if (!fileType || !acceptedTypes.includes(fileType))
                    continue;
                console.log(nextDir);
                const baseName = nextDir.replace(/\.[^.]+$/, "");
                const hasNineslice = nextDirs.some((dir) => dir === `${baseName}.json`);
                const textElement = ChooseImageFileTree.constructTextElement(nextDir, hasChildren, hasNineslice);
                textElement.style.left = `${config.magicNumbers.explorer.nonFolderIndentation - (depth === 0 ? 20 : 0)}px`;
                lastTextElement.appendChild(textElement);
            }
        }
    }
}
export async function chooseImageModal() {
    return new Promise((resolve, reject) => {
        form.innerHTML = "";
        ChooseImageFileTree.tree(GLOBAL_FILE_SYSTEM, form);
        const handleClick = (event) => {
            const element = event.composedPath()[0];
            if (!element?.classList.contains("explorerText"))
                return;
            const fileName = element.textContent?.trim();
            if (!fileName)
                return;
            const validExtensions = ["png", "jpg", "jpeg", "webp"];
            const isImage = validExtensions.some((ext) => fileName.endsWith(`.${ext}`));
            if (!isImage)
                return;
            // Build directory chain
            const parents = [];
            let current = element.parentElement;
            while (current && current.classList.contains("explorerDiv")) {
                const parentText = current.querySelector(".explorerText")?.textContent?.trim();
                if (parentText)
                    parents.push(parentText);
                current = current.parentElement;
            }
            const filePath = parents.reverse().join("/").replace(/\.[^/.]+$/, "");
            console.log(`File Path: ${filePath}`);
            cleanup();
            resolve(filePath);
        };
        const handleClose = () => {
            cleanup();
            reject(new Error("Modal closed"));
        };
        const handleWindowClick = (event) => {
            if (event.target === modal) {
                cleanup();
                reject(new Error("Modal closed"));
            }
        };
        const cleanup = () => {
            document.removeEventListener("click", handleClick);
            closeBtn.removeEventListener("click", handleClose);
            window.removeEventListener("click", handleWindowClick);
            modal.style.display = "none";
            form.innerHTML = "";
        };
        // Add all listeners
        document.addEventListener("click", handleClick);
        closeBtn.addEventListener("click", handleClose);
        window.addEventListener("click", handleWindowClick);
        modal.style.display = "block";
    });
}
//# sourceMappingURL=chooseImage.js.map