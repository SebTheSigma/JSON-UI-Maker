import { DraggableButton } from "../elements/button.js";
import { GLOBAL_ELEMENT_MAP } from "../index.js";
export class ActionFormData {
    titleString;
    formText;
    buttons;
    constructor() {
        this.buttons = [];
        console.log("Form has been created");
    }
    title(title) {
        this.titleString = title;
        console.log("Form title has been added");
    }
    button(text, texture) {
        this.buttons.push({ text: text, texture: texture });
        console.log("Form button has been added");
    }
    body(text) {
        this.formText = text;
        console.log("Form body has been added");
    }
    show() {
        for (let i = 0; i < this.buttons.length; i++) {
            console.log(this.buttons[i]);
            const buttonElements = Array.from(GLOBAL_ELEMENT_MAP.values()).filter((element) => {
                if (!(element instanceof DraggableButton))
                    return false;
                const index = element.button.dataset?.collectionIndex;
                if (!index)
                    return false;
                return Number(index) == i;
            });
            console.log(buttonElements.map((element) => [element.button.dataset?.id, element.button.className]));
        }
    }
}
//# sourceMappingURL=form.js.map