import { images } from "../index.js";
import { updateImageDropdown } from "./imageDropdown.js";
export class FileUploader {
    /**
     * Handles the event when a file is selected in the "Open Pack" dialog.
     * Loads the selected pack into the image map.
     */
    static handlePackUpload() {
        const fileInput = document.getElementById("pack_importer");
        if (!fileInput?.files)
            return;
        const files = Array.from(fileInput.files);
        // Debug: list all files
        files.forEach((file) => console.log('Filename', file.name));
        FileUploader.processFileUpload(files);
    }
    static async processFileUpload(files) {
        const pngFiles = files.filter((file) => file.name.endsWith(".png"));
        const tasks = pngFiles.map(async (pngFile) => {
            const baseName = pngFile.name.replace(/\.[^.]*$/, "");
            const imageData = await this.readImageAsImageData(pngFile);
            const existingData = images.get(baseName) ?? {};
            existingData.png = imageData;
            images.set(baseName, existingData);
            const jsonFile = files.find((file) => file.name === `${baseName}.json`);
            if (jsonFile) {
                try {
                    const json = await this.readJsonFile(jsonFile);
                    existingData.json = json;
                    images.set(baseName, existingData);
                }
                catch (err) {
                    console.error(`Error parsing JSON for ${baseName}:`, err);
                }
            }
            updateImageDropdown();
        });
        await Promise.all(tasks);
    }
    static readJsonFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                try {
                    resolve(JSON.parse(reader.result));
                }
                catch (err) {
                    reject(err);
                }
            };
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }
    static readImageAsImageData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0);
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    resolve(imageData);
                };
                img.onerror = reject;
                img.src = reader.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
    static isFileUploaded(fileName) {
        return images.has(fileName);
    }
    static async getAssetAsFile(path, filename) {
        const response = await fetch(path);
        const blob = await response.blob();
        const file = new File([blob], filename, { type: blob.type });
        return file;
    }
}
//# sourceMappingURL=openFiles.js.map