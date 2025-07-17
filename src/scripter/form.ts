import { DraggableButton } from "../elements/button.js";
import { GLOBAL_ELEMENT_MAP } from "../index.js";

type FormButton = {
    text: string;
    texture: string;
};

export class ActionFormData {
    public titleString?: string;
    public formText?: string;
    public buttons: FormButton[];

    constructor() {
        this.buttons = [];
        console.log("Form has been created");
    }

    public title(title: string): void {
        this.titleString = title;
        console.log("Form title has been added");
    }

    public button(text: string, texture: string): void {
        this.buttons.push({ text: text, texture: texture });
        console.log("Form button has been added");
    }

    public body(text: string): void {
        this.formText = text;
        console.log("Form body has been added");
    }

    public show() {
        for (let i = 0; i < this.buttons.length; i++) {
            console.log(this.buttons[i]);

            const buttonElements = Array.from(GLOBAL_ELEMENT_MAP.values()).filter((element) => {
                if ( !(element instanceof DraggableButton)) return false;

                const index = element.button.dataset?.collectionIndex;
                if (!index) return false;

                return Number(index) == i;
            }) as DraggableButton[];

            console.log(buttonElements.map((element) => [element.button.dataset?.id, element.button.className]));
        }
    }
}
