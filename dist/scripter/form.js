export class ActionFormData {
    titleString;
    formText;
    buttons;
    constructor() {
        this.buttons = [];
        console.log('Form has been created');
    }
    title(title) {
        this.titleString = title;
        console.log('Form title has been added');
    }
    button(text, texture) {
        this.buttons.push({ text: text, texture: texture });
        console.log('Form button has been added');
    }
    body(text) {
        this.formText = text;
        console.log('Form body has been added');
    }
}
//# sourceMappingURL=form.js.map