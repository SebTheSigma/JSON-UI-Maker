export interface User {
    id: number;
    username: string;
}
declare class AuthManager {
    private currentUser;
    private readonly STORAGE_KEY;
    init(): void;
    signup(username: string, password: string): Promise<{
        success: boolean;
        message: string;
    }>;
    signin(username: string, password: string): Promise<{
        success: boolean;
        message: string;
    }>;
    logout(): void;
    getCurrentUser(): User | null;
    isAuthenticated(): boolean;
    private saveToStorage;
}
export declare const authManager: AuthManager;
export {};
