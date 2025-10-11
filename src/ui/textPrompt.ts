import { GeneralUtil } from "../util/generalUtil.js";

export class TextPrompt {
    public promptBox: HTMLElement;
    public textarea: HTMLInputElement | HTMLTextAreaElement;
    
    public attached: boolean = false;
    public offset: [number, number] = [0, -5];
    public hovered: boolean = false;

    public lastSelectionStart: number = 0;
    public lastSelectionEnd: number = 0;

    public highlightedIndex: number = 0;

    public data: any = {};

    public textOptions: string[] = [];
    public actions: ((value: string) => void)[] = [];

    constructor(textarea: HTMLInputElement | HTMLTextAreaElement) {
        this.promptBox = document.createElement("div");
        this.promptBox.classList.add("textPrompt");
        this.promptBox.contentEditable = "false";
        this.promptBox.spellcheck = false;
        this.promptBox.style.display = "none";

        this.textarea = textarea;

        this.promptBox.addEventListener("mouseenter", () => {
            this.hovered = true;
        });

        this.promptBox.addEventListener("mouseleave", () => {
            this.hovered = false;
        });

        this.textarea.addEventListener("selectionchange", () => {
            this.lastSelectionStart = this.textarea.selectionStart ?? 0;
            this.lastSelectionEnd = this.textarea.selectionEnd ?? 0;
        });

        this.textarea.addEventListener("scroll", () => this.detach());

        document.body.appendChild(this.promptBox);
    }

    public addTextOptions(text: string[], actions: ((value: string) => void)[] | ((value: string) => void)): void {
        this.promptBox.innerHTML = "";
        this.highlightedIndex = 0;

        if (typeof actions === "function") actions = new Array(text.length).fill(actions);

        if (text.length != actions.length) throw new Error("Text and actions arrays must be the same length");

        this.textOptions = text;
        this.actions = actions;

        let highlightedElement: HTMLElement | null = null;

        for (let i = 0; i < text.length; i++) {
            let option = text[i]!;
            const action = actions[i]!;

            const optionElement = document.createElement("div");

            if (i === this.highlightedIndex) {
                optionElement.classList.add("textPromptOptionHighlighted");
                highlightedElement = optionElement;
            }
            else optionElement.classList.add("textPromptOption");

            optionElement.onclick = () => {
                this.detach();
                action(option);
            };

            optionElement.textContent = option;
            this.promptBox.appendChild(optionElement);
        }

        this.updatePosition();

        if (!highlightedElement) throw new Error("No highlighted element found");
        highlightedElement.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "nearest"
        });
    }

    public updatePosition(): void {
        const coords = GeneralUtil.getCaretScreenPosition(this.textarea);

        let left = coords.left + this.offset[0];
        let top = coords.top - this.promptBox.getBoundingClientRect().height + this.offset[1];
        const padding = 10;

        const rect = this.promptBox.getBoundingClientRect();

        if (left + rect.width > window.innerWidth) left = window.innerWidth - rect.width - padding;

        this.promptBox.style.left = `${left}px`;
        this.promptBox.style.top = `${top}px`;
    }

    public attach(): void {
        this.promptBox.style.display = "block";
        this.attached = true;
        this.textarea.addEventListener("input", () => this.updatePosition());
    }

    public detach(): void {
        this.promptBox.style.display = "none";
        this.attached = false;
        this.textarea.removeEventListener("input", () => this.updatePosition());
    }

    public autoCorrectHighlightedText(): void {

        // Loops around when it goes to the top or bottom
        const index = GeneralUtil.loopClamp(this.highlightedIndex, this.textOptions.length);

        const option = this.textOptions[index]!;
        this.detach();

        if (this.actions.length !== this.textOptions.length) throw new Error("Text and actions arrays must be the same length");
        if (index > this.actions.length - 1) throw new Error("Highlighted index is out of actions bounds");

        const action = this.actions[index];
        if (!action) throw new Error("No action found");

        action(option);
    }

    public setHighlightedIndex(index: number) {
        const oldHighlighted = this.promptBox.children[this.highlightedIndex]!;
        oldHighlighted.className = "textPromptOption";

        // Updates the index
        this.highlightedIndex = GeneralUtil.loopClamp(index, this.textOptions.length);

        const newHighlighted = this.promptBox.children[this.highlightedIndex]!;
        newHighlighted.className = "textPromptOptionHighlighted";

        // Makes sure that its scrolled to be viewing the selected element
        newHighlighted.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "nearest"
        });

    }

    public delete(): void {
        this.detach();

        this.textarea.removeEventListener("selectionchange", () => {
            this.lastSelectionStart = this.textarea.selectionStart ?? 0;
            this.lastSelectionEnd = this.textarea.selectionEnd ?? 0;
        });

        this.textarea.removeEventListener("scroll", () => this.detach());

        this.promptBox.remove();
    }
}
