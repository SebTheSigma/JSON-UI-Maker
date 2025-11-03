export declare class PresetManagementModal {
    private modal;
    init(): void;
    show(): void;
    hide(): void;
    private createModal;
    private setupEventListeners;
    private loadPresets;
    private createPresetItemHtml;
    private attachEventListeners;
    startEditPreset(presetId: number): void;
    savePresetName(presetId: number): Promise<void>;
    cancelEditPreset(presetId: number): void;
    togglePresetVisibility(presetId: number): Promise<void>;
    deletePreset(presetId: number): Promise<void>;
    refreshPresets(): Promise<void>;
}
export declare const presetManagementModal: PresetManagementModal;
