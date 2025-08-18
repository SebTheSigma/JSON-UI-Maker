export class Notification {
    public message: string;
    public showTimeMs: number;
    public element: HTMLElement;

    constructor(message: string, showTimeMs: number = 2000, type: 'warning' | 'error' | 'notif' = 'notif') {
        this.message = message;
        this.showTimeMs = showTimeMs;

        // Ensure container exists
        const container = document.getElementById("notif-container")!;

        this.element = document.createElement("div");
        this.element.className = "clipboard-notif"; // Use class instead of ID

        if (type == 'warning') {
            this.element.style.backgroundColor = "rgb(196, 111, 0)";
            this.element.innerHTML = `⚠️ ${this.message}`;
        }
        else if (type == 'error') {
            this.element.style.backgroundColor = "red";
            this.element.innerHTML = `⚠️ ${this.message}`;
        }

        else if (type == 'notif') {
            this.element.innerHTML = `${this.message}`;
        }


        container.appendChild(this.element);

        this.show();
    }

    public show(): void {
        requestAnimationFrame(() => this.element.classList.add('show')); // trigger animation

        setTimeout(() => this.element.classList.remove('show'), this.showTimeMs);
        setTimeout(() => this.delete(), this.showTimeMs + 500);
    }

    public delete(): void {
        this.element.remove();
    }
}
