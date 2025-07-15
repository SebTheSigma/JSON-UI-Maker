
type FormButton = {
    text: string;
    texture: string;
}

export class ActionFormData {
    public titleString?: string;
    public formText?: string;
    public buttons: FormButton[];
    
    constructor() {
        this.buttons = [];
        console.log('Form has been created');
    }

    public title(title: string): void {
        this.titleString = title;
        console.log('Form title has been added');
    }

    public button(text: string, texture: string): void {
        this.buttons.push({ text: text, texture: texture });
        console.log('Form button has been added');
    }

    public body(text: string): void {
        this.formText = text;
        console.log('Form body has been added');
    }
}