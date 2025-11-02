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
// Valid image extensions used in multiple places
const VALID_IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "webp"];
// Recursively collect all image paths (without extension) from the virtual file system
function collectImagePaths(fsObj, currentPath = "") {
    const paths = [];
    for (const key of Object.keys(fsObj)) {
        const value = fsObj[key];
        const joinedPath = currentPath ? `${currentPath}/${key}` : key;
        const ext = key.split(".").pop();
        // If we have children this is a directory
        if (typeof value === "object" && value !== null && Object.keys(value).length > 0) {
            paths.push(...collectImagePaths(value, joinedPath));
        }
        else if (ext && VALID_IMAGE_EXTENSIONS.includes(ext)) {
            // Strip extension to stay consistent with existing behaviour
            paths.push(joinedPath.replace(/\.[^/.]+$/, ""));
        }
    }
    return paths;
}
export async function chooseImageModal() {
    return new Promise((resolve, reject) => {
        // Clean up any existing search wrapper first
        const existingSearchWrapper = form.parentElement?.querySelector(".chooseImageSearchWrapper");
        if (existingSearchWrapper) {
            existingSearchWrapper.remove();
        }
        // Clear previous content
        form.innerHTML = "";
        // -------------------- NEW: Search UI --------------------
        const searchWrapper = document.createElement("div");
        searchWrapper.classList.add("chooseImageSearchWrapper");
        const searchInput = document.createElement("input");
        searchInput.type = "text";
        searchInput.placeholder = "Search images...";
        searchInput.classList.add("chooseImageSearchInput");
        searchInput.spellcheck = false;
        searchWrapper.appendChild(searchInput);
        const dropdown = document.createElement("select");
        dropdown.size = 6; // show few results at once
        dropdown.classList.add("chooseImageSearchDropdown");
        dropdown.style.display = "none"; // hidden until there is query
        searchWrapper.appendChild(dropdown);
        // Insert search UI before the tree container (form)
        form.parentElement?.insertBefore(searchWrapper, form);
        // Prepare list of all image paths (without extension) once
        const allImagePaths = collectImagePaths(GLOBAL_FILE_SYSTEM);
        const updateDropdown = () => {
            const query = searchInput.value.toLowerCase();
            // Clear previous options
            dropdown.innerHTML = "";
            if (!query) {
                dropdown.style.display = "none";
                return;
            }
            const filtered = allImagePaths.filter((p) => p.toLowerCase().includes(query)).slice(0, 50); // limit 50 results
            if (filtered.length === 0) {
                dropdown.style.display = "none";
                return;
            }
            for (const path of filtered) {
                const option = document.createElement("option");
                option.value = path;
                option.textContent = path;
                dropdown.appendChild(option);
            }
            dropdown.style.display = "block";
        };
        searchInput.addEventListener("input", updateDropdown);
        dropdown.addEventListener("change", () => {
            const selected = dropdown.value;
            if (selected) {
                cleanup();
                resolve(selected);
            }
        });
        // -------------------- END Search UI --------------------
        // Build tree view as before
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
            // Remove the search wrapper if it exists
            const existingSearchWrapper = form.parentElement?.querySelector(".chooseImageSearchWrapper");
            if (existingSearchWrapper) {
                existingSearchWrapper.remove();
            }
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