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
    // Adds the dropdown options
    for (const [fileName, data] of images.entries()) {
        console.log(fileName);
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
//# sourceMappingURL=imageDropdown.js.map