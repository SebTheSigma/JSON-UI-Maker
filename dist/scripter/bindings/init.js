import { config } from "../../CONFIG.js";
import { selectedElement } from "../../index.js";
import { GeneralUtil } from "../../util/generalUtil.js";
export class BindingsArea {
    static placeHolderBindings = `[
  {
    binding_name: "#title_text"
  },
  {
    binding_type: "view",
    source_property_name: "((#title_text - 'my_text') = #title_text)",
    target_property_name: "#visible"
  }
]`;
    static bindingsTextArea = document.getElementById("bindings");
    static errorMessage = document.getElementById("errorMessage");
    static isBindingsTextAreaFocused = false;
    static init() {
        this.bindingsTextArea.value = "";
        this.bindingsTextArea.placeholder = this.placeHolderBindings;
        this.bindingsTextArea.addEventListener("focus", () => {
            this.isBindingsTextAreaFocused = true;
        });
        this.bindingsTextArea.addEventListener("blur", () => {
            this.isBindingsTextAreaFocused = false;
        });
        this.bindingsTextArea.addEventListener("input", () => {
            console.log("Text changed");
            if (!selectedElement) {
                this.bindingsTextArea.value = "";
                return;
            }
            if (this.bindingsTextArea.value === "") {
                this.errorMessage.style.visibility = "hidden";
                return;
            }
            const selectedElementClass = GeneralUtil.elementToClassElement(selectedElement);
            let parsedBindings = [];
            try {
                parsedBindings = JSON.parse(this.bindingsTextArea.value);
                this.errorMessage.style.visibility = "hidden";
            }
            catch (e) {
                this.errorMessage.style.visibility = "visible";
                this.errorMessage.title = "Invalid JSON";
                return;
            }
            selectedElementClass.bindings = parsedBindings;
            console.log(selectedElementClass.bindings);
        });
        this.bindingsTextArea.addEventListener("paste", (e) => {
            // Get pasted text from clipboard
            const pastedText = (e.clipboardData || window.clipboardData).getData("text");
            console.log("Pasted:", pastedText);
            try {
                const parsed = JSON.parse(pastedText);
                e.preventDefault();
                this.bindingsTextArea.value = JSON.stringify(parsed, null, config.magicNumbers.textEditor.indentation);
            }
            catch { }
        });
    }
    static format() {
        if (this.errorMessage.style.visibility === "visible")
            return;
        this.bindingsTextArea.value = JSON.stringify(JSON.parse(this.bindingsTextArea.value), null, config.magicNumbers.textEditor.indentation);
    }
    static indent(e) {
        e.preventDefault();
        const start = this.bindingsTextArea.selectionStart;
        const end = this.bindingsTextArea.selectionEnd;
        this.bindingsTextArea.value =
            this.bindingsTextArea.value.substring(0, start) +
                " ".repeat(config.magicNumbers.textEditor.indentation) +
                this.bindingsTextArea.value.substring(end);
        this.bindingsTextArea.selectionStart = this.bindingsTextArea.selectionEnd = start + config.magicNumbers.textEditor.indentation;
    }
    static tryOpenBrackets(e) {
        const start = this.bindingsTextArea.selectionStart;
        const end = this.bindingsTextArea.selectionEnd;
        if (start !== end)
            return false;
        const startChar = this.bindingsTextArea.value[start - 1];
        const endChar = this.bindingsTextArea.value[end];
        console.log(startChar, endChar);
        if ((startChar === "{" && endChar === "}") || (startChar === "[" && endChar === "]")) {
            e.preventDefault();
            console.log("Opening brackets");
            const currentLineIndex = this.bindingsTextArea.value.substring(0, start).split("\n").length - 1;
            const lines = this.bindingsTextArea.value.split("\n");
            const line = lines[currentLineIndex];
            let whiteSpaces = 0;
            for (let i = 0; i < line?.length; i++) {
                if (line[i] == " ")
                    whiteSpaces++;
                else
                    break;
            }
            const currentIndentaion = Math.floor(whiteSpaces / config.magicNumbers.textEditor.indentation);
            this.bindingsTextArea.value =
                this.bindingsTextArea.value.substring(0, start) +
                    "\n\n" +
                    " ".repeat(config.magicNumbers.textEditor.indentation * currentIndentaion) +
                    this.bindingsTextArea.value.substring(end);
            this.bindingsTextArea.selectionStart = this.bindingsTextArea.selectionEnd = start + 1;
            console.log("Current indentation", currentIndentaion);
            for (let i = 0; i <= currentIndentaion; i++) {
                this.indent(e);
            }
            return true;
        }
        return false;
    }
    static updateBindingsEditor() {
        if (!selectedElement) {
            this.bindingsTextArea.value = "";
            return;
        }
        const selectedElementClass = GeneralUtil.elementToClassElement(selectedElement);
        const bindings = selectedElementClass.bindings;
        this.bindingsTextArea.value = bindings.length === 0 ? "" : JSON.stringify(bindings);
    }
    static handleKeyboardInput(e) {
        if (e?.ctrlKey && e?.shiftKey)
            return this.indent(e);
        else if (e?.key == "Enter") {
            if (!this.tryOpenBrackets(e)) {
                const start = this.bindingsTextArea.selectionStart;
                const currentLineIndex = this.bindingsTextArea.value.substring(0, start).split("\n").length - 1;
                const lines = this.bindingsTextArea.value.split("\n");
                const line = lines[currentLineIndex];
                let whiteSpaces = 0;
                for (let i = 0; i < line?.length; i++) {
                    if (line[i] == " ")
                        whiteSpaces++;
                    else
                        break;
                }
                const currentIndentaion = Math.floor(whiteSpaces / config.magicNumbers.textEditor.indentation);
                setTimeout(() => {
                    for (let i = 0; i < currentIndentaion; i++) {
                        this.indent(e);
                    }
                }, 0);
            }
        }
        else if (e?.key == "[") {
            const start = this.bindingsTextArea.selectionStart;
            const end = this.bindingsTextArea.selectionEnd;
            console.log(start, end, 55);
            e.preventDefault();
            this.bindingsTextArea.value = this.bindingsTextArea.value.substring(0, start) + "[]" + this.bindingsTextArea.value.substring(end);
            this.bindingsTextArea.selectionStart = this.bindingsTextArea.selectionEnd = start + 1;
        }
        else if (e?.key == "{") {
            const start = this.bindingsTextArea.selectionStart;
            const end = this.bindingsTextArea.selectionEnd;
            e.preventDefault();
            this.bindingsTextArea.value = this.bindingsTextArea.value.substring(0, start) + "{}" + this.bindingsTextArea.value.substring(end);
            this.bindingsTextArea.selectionStart = this.bindingsTextArea.selectionEnd = start + 1;
        }
        else if (e?.key == '"') {
            const start = this.bindingsTextArea.selectionStart;
            const end = this.bindingsTextArea.selectionEnd;
            e.preventDefault();
            this.bindingsTextArea.value = this.bindingsTextArea.value.substring(0, start) + '""' + this.bindingsTextArea.value.substring(end);
            this.bindingsTextArea.selectionStart = this.bindingsTextArea.selectionEnd = start + 1;
        }
        else if (e?.key == `'`) {
            const start = this.bindingsTextArea.selectionStart;
            const end = this.bindingsTextArea.selectionEnd;
            e.preventDefault();
            this.bindingsTextArea.value = this.bindingsTextArea.value.substring(0, start) + `''` + this.bindingsTextArea.value.substring(end);
            this.bindingsTextArea.selectionStart = this.bindingsTextArea.selectionEnd = start + 1;
        }
    }
}
BindingsArea.init();
//# sourceMappingURL=init.js.map