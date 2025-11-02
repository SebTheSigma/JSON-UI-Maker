export declare class FileUploader {
    static addToFileSystem(file: File): void;
    /**
     * Handles the event when a file is selected in the "Open Pack" dialog.
     * Loads the selected pack into the image map.
     */
    static handleUiTexturesUpload(): void;
    static processFileUpload(files: File[]): Promise<void>;
    static readJsonFile(file: File): Promise<any>;
    private static readImageAsImageData;
    static isFileUploaded(fileName: string): boolean;
    static getAssetAsFile(path: string, filename: string): Promise<File>;
}
