import { images, Builder } from "../index.js";
export function updateImageDropdown() {
    const dropdown = document.getElementById("addImageDropdown");
    // Removes all dropdown options
    dropdown.innerHTML = "";
    // Adds the dropdown options
    for (const [fileName, data] of images.entries()) {
        console.log(fileName);
        const fileNameText = document.createElement("div");
        fileNameText.className = "dropdownContent";
        fileNameText.textContent = fileName;
        fileNameText.onclick = function () {
            Builder.addImage(fileName);
        };
        dropdown.appendChild(fileNameText);
    }
}
//# sourceMappingURL=imageDropdown.js.map