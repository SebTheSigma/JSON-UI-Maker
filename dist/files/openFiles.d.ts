export declare class FileUploader {
    /**
     * Handles the event when a file is selected in the "Open Pack" dialog.
     * Loads the selected pack into the image map.
     */
    static handlePackUpload(): void;
    static processFileUpload(files: File[]): Promise<void>;
    private static readJsonFile;
    private static readImageAsImageData;
    static isFileUploaded(fileName: string): boolean;
    static getAssetAsFile(path: string, filename: string): Promise<File>;
}
