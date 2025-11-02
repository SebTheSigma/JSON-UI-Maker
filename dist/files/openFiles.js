import { GLOBAL_FILE_SYSTEM, images, setFileSystem } from "../index.js";
import { Notification } from "../ui/notifs/noficationMaker.js";
export class FileUploader {
    static addToFileSystem(file) {
        const dir = file.webkitRelativePath || file._webkitRelativePath;
        const parts = dir.split("/");
        const fs = GLOBAL_FILE_SYSTEM;
        let current = fs;
        for (const part of parts) {
            if (part === "")
                continue;
            if (!current[part])
                current[part] = {};
            current = current[part];
        }
        setFileSystem(fs);
    }
    /**
     * Handles the event when a file is selected in the "Open Pack" dialog.
     * Loads the selected pack into the image map.
     */
    static handleUiTexturesUpload() {
        const fileInput = document.getElementById("ui_textures_importer");
        if (!fileInput?.files)
            return;
        const firstDir = fileInput?.files[0]?.webkitRelativePath.split("/")[0];
        console.log(firstDir);
        if (firstDir !== "ui") {
            new Notification(`Selected file is not a ui folder
                All textures paths will be starting with "${firstDir}".
                May not work in-game!`, 5000, "warning");
        }
        const files = Array.from(fileInput.files);
        // Debug: list all files
        files.forEach((file) => console.log("Filename", file.name));
        FileUploader.processFileUpload(files);
    }
    static async processFileUpload(files) {
        for (const file of files) {
            this.addToFileSystem(file);
        }
        console.log(GLOBAL_FILE_SYSTEM);
        const pngFiles = files.filter((file) => file.name.endsWith(".png") || file.name.endsWith(".jpg") || file.name.endsWith(".jpeg") || file.name.endsWith(".webp"));
        const tasks = pngFiles.map(async (pngFile) => {
            const dir = pngFile.webkitRelativePath || pngFile._webkitRelativePath;
            const baseName = dir.replace(/\.[^.]*$/, "");
            console.warn(baseName);
            const imageData = await this.readImageAsImageData(pngFile);
            console.warn(imageData);
            const existingData = images.get(baseName) ?? {};
            existingData.png = imageData;
            images.set(baseName, existingData);
            const jsonFile = files.find((file) => (file.webkitRelativePath || file._webkitRelativePath) === `${baseName}.json`);
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