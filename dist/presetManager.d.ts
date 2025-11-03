interface Preset {
    id: number;
    user_id: number;
    name: string;
    png_path: string;
    json_path: string;
    is_public: boolean;
    created_at: string;
}
declare class PresetManager {
    private readonly STORAGE_PREFIX;
    uploadPreset(files: FileList, presetName: string, isPublic?: boolean): Promise<{
        success: boolean;
        message: string;
    }>;
    getUserPresets(): Promise<Preset[]>;
    getPublicPresets(): Promise<Preset[]>;
    makePresetPublic(presetId: number): Promise<{
        success: boolean;
        message: string;
    }>;
    getPresetData(preset: Preset): {
        pngData: string;
        jsonData: any;
    } | null;
    private isValidNinesliceJson;
    private fileToBase64;
    /**
     * Loads preset textures directly into the system after upload
     */
    private loadPresetTexturesIntoSystem;
    /**
     * Helper function to create ImageData from base64
     */
    private createImageDataFromBase64;
}
export declare const presetManager: PresetManager;
export {};
