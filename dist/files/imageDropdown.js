import { images, Builder } from "../index.js";
let currentInputs = [];
export function updateImageDropdown() {
    const dropdown = document.getElementById("addImageDropdown");
    // Removes all dropdown options
    dropdown.innerHTML = "";
    // Removes old event listeners
    for (let input of currentInputs) {
        input.oninput = null;
    }
    currentInputs = [];
    // Add a search input
    const search = document.createElement("input");
    search.className = "propertyInput";
    search.placeholder = "Search textures...";
    search.spellcheck = false;
    dropdown.appendChild(search);
    const render = () => {
        // Clear existing items
        for (const el of Array.from(dropdown.querySelectorAll('.dropdownContent'))) {
            el.remove();
        }
        const q = search.value.toLowerCase();
        for (const [fileName] of images.entries()) {
            if (!q || fileName.toLowerCase().includes(q)) {
                const fileNameText = document.createElement("div");
                fileNameText.className = "dropdownContent";
                fileNameText.textContent = fileName;
                fileNameText.onclick = function () {
                    Builder.addImage(fileName);
                };
                currentInputs.push(fileNameText);
                dropdown.appendChild(fileNameText);
            }
        }
    };
    search.oninput = render;
    render();
}
//# sourceMappingURL=imageDropdown.js.map
