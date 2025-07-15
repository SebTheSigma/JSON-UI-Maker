import { images, Builder } from "../index.js"


let currentInputs: HTMLDivElement[] = [];
export function updateImageDropdown(): void {
    const dropdown: HTMLElement = document.getElementById("addImageDropdown")!;

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

        const fileNameText: HTMLDivElement = document.createElement("div");
        fileNameText.className = "dropdownContent";
        fileNameText.textContent = fileName;
        fileNameText.onclick = function () {
            Builder.addImage(fileName);
        };
        currentInputs.push(fileNameText);

        dropdown.appendChild(fileNameText);
    }
}