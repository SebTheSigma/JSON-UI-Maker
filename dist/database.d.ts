interface User {
    id: number;
    username: string;
    password_hash: string;
    created_at: string;
}
interface Preset {
    id: number;
    user_id: number;
    name: string;
    png_path: string;
    json_path: string;
    is_public: boolean;
    created_at: string;
}
declare class DatabaseManager {
    private db;
    private SQL;
    private readonly STORAGE_KEY;
    private readonly MANUAL_DATA_KEY;
    private presetsCache;
    private usersCache;
    init(): Promise<void>;
    private loadManualData;
    private restoreDataToDatabase;
    private saveManualData;
    private createTables;
    createUser(username: string, password: string): Promise<User>;
    getUser(username: string): Promise<User | null>;
    authenticateUser(username: string, password: string): Promise<User | null>;
    createPreset(userId: number, name: string, pngPath: string, jsonPath: string, isPublic?: boolean): Promise<Preset>;
    getUserPresets(userId: number): Promise<Preset[]>;
    getPublicPresets(): Promise<Preset[]>;
    updatePreset(presetId: number, updates: {
        is_public?: boolean;
        name?: string;
    }): Promise<void>;
    deletePreset(presetId: number): Promise<void>;
    private hashPassword;
    private verifyPassword;
    exportDatabase(): Uint8Array;
    importDatabase(buffer: Uint8Array): void;
    save(): void;
    close(): void;
}
export declare const dbManager: DatabaseManager;
export declare function loadSqlJs(): Promise<void>;
export {};
