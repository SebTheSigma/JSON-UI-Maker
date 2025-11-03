export declare class AuthModal {
    private modal;
    private isSignupMode;
    init(): void;
    show(signup?: boolean): void;
    hide(): void;
    private createModal;
    private setupEventListeners;
    private toggleMode;
    private updateModalContent;
    private handleSubmit;
    private showMessage;
    private hideMessage;
}
export declare const authModal: AuthModal;
