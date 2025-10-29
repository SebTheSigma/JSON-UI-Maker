import { config } from "../../CONFIG.js";

const modal: HTMLElement = document.getElementById("modalCreateForm")!;

const options = [
    {
        type: "text",
        name: "title_flag",
        displayName: "Title Flag",
        required: true,
        default: config.title_flag,
        body: "Will be set as your title flag in scripts<br>Cant start with a number",
        condition: (value: string) => /^[^0-9].*$/.test(value) && value !== '' && value
    },
];

interface CreateFormOptions {
    title?: string;
    [key: string]: any;
}


export async function createFormModal(): Promise<CreateFormOptions> {
    modal.style.display = "block";

    const form: HTMLElement = document.getElementsByClassName("modalCreateFormForm")[0] as HTMLFormElement;

    // Clears the form
    form.innerHTML = "";

    const elements: HTMLInputElement[] = [];
    // Adds the options
    for (let option of options) {
        const input = document.createElement("input");
        input.type = option.type;
        input.name = option.name;
        input.style.maxWidth = "100px";
        input.className = 'modalOptionInput';
        input.value = option.default ?? '';

        const label = document.createElement("label");
        label.textContent = `${option.displayName}: `;
        label.className = 'modalOptionLabel';

        

        // Add the nodes
        form.appendChild(label);
        form.appendChild(input);

        if (option.required) {
            const requiredLabel = document.createElement("label");
            requiredLabel.textContent = '*';
            requiredLabel.className = 'modalRequiredLabel';
            requiredLabel.style.fontSize = '20px';
            requiredLabel.style.color = 'red';
            form.appendChild(requiredLabel);
        }

        form.appendChild(document.createElement("br"));

        if (option.body) {
            const body = document.createElement("label");
            body.innerHTML = option.body;
            body.className = 'modalOptionBody';
            form.appendChild(body);
            form.appendChild(document.createElement("br"));
        }

        elements.push(input);
    }

    // Make submit button
    const submit = document.createElement("input");
    submit.type = "submit";
    submit.value = "Create";
    submit.className = 'modalSubmitButton';

    // Add submit button
    form.appendChild(submit);

    const fields: CreateFormOptions = {};

    return new Promise((resolve: (textures: CreateFormOptions) => void): void => {
        submit.onclick = () => {

            for (let i = 0; i < elements.length; i++) {
                const element = elements[i]!;
                const value = element.value;

                if (options[i]?.required && !value) return;

                if (options[i]?.condition && !options[i]?.condition(value)) return;

                fields[element.name] = value;
            }

            modal.style.display = "none";

            resolve(fields);
        };
    });
}
