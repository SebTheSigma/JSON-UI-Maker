export declare class Notification {
    message: string;
    showTimeMs: number;
    element: HTMLElement;
    constructor(message: string, showTimeMs?: number, type?: 'warning' | 'error' | 'notif');
    show(): void;
    delete(): void;
}
