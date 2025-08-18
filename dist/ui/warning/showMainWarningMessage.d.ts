declare class MainWarningMessage {
    static shouldShow: boolean;
    static shown: boolean;
    static show(): void;
    static hide(): void;
    static addMessage(message: string): void;
    static clearMessages(): void;
}
