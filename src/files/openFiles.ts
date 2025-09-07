import { images } from "../index.js";
import { updateImageDropdown } from "./imageDropdown.js";

export class FileUploader {
    /**
     * Handles the event when a file is selected in the "Open Pack" dialog.
     * Loads the selected pack into the image map.
     */
    public static handleUiTexturesUpload(): void {
        const fileInput = document.getElementById("ui_textures_importer") as HTMLInputElement | null;
        if (!fileInput?.files) return;

        const files = Array.from(fileInput.files);

        // Debug: list all files
        files.forEach((file) => console.log('Filename', file.name));

        FileUploader.processFileUpload(files);
    }

    public static async processFileUpload(files: File[]): Promise<void> {
        const pngFiles = files.filter((file) => file.name.endsWith(".png") || file.name.endsWith(".jpg") || file.name.endsWith(".jpeg") || file.name.endsWith(".webp"));

        const tasks = pngFiles.map(async (pngFile) => {
            const baseName = pngFile.name.replace(/\.[^.]*$/, "");

            const imageData = await this.readImageAsImageData(pngFile);
            console.warn(imageData);

            const existingData = images.get(baseName) ?? {};
            existingData.png = imageData;
            images.set(baseName, existingData);

            const jsonFile = files.find((file) => file.name === `${baseName}.json`);
            if (jsonFile) {
                try {
                    const json = await this.readJsonFile(jsonFile);
                    existingData.json = json;
                    images.set(baseName, existingData);
                } catch (err) {
                    console.error(`Error parsing JSON for ${baseName}:`, err);
                }
            }

            updateImageDropdown();
        });

        await Promise.all(tasks);
    }

    private static readJsonFile(file: File): Promise<any> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                try {
                    resolve(JSON.parse(reader.result as string));
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }

    private static readImageAsImageData(file: File): Promise<ImageData> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext("2d")!;
                    ctx.drawImage(img, 0, 0);
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    resolve(imageData);
                };
                img.onerror = reject;
                img.src = reader.result as string;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    public static isFileUploaded(fileName: string): boolean {
        return images.has(fileName);
    }

    public static async getAssetAsFile(path: string, filename: string): Promise<File> {
        const response = await fetch(path);
        const blob = await response.blob();
        const file = new File([blob], filename, { type: blob.type });
        return file;
    }
}
