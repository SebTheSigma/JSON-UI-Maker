import { config } from "../../CONFIG.js";
import { selectedElement } from "../../index.js";
import { TextPrompt } from "../../ui/textPrompt.js";
import { GeneralUtil } from "../../util/generalUtil.js";
import { binding_keys } from "./binding_keys.js";
import { collectSourcePropertyNames } from "./source_property_name.js";
export class BindingsArea {
    static placeHolderBindings = `[
  {
    "binding_name": "#title_text"
  },
  {
    "binding_type": "view",
    "source_property_name": "(#title_text - 'example_text')",
    "target_property_name": "#text"
  }
]`;
    static bindingsTextArea = document.getElementById("bindings");
    static errorMessage = document.getElementById("errorMessage");
    static isBindingsTextAreaFocused = false;
    static BindingsTextPrompt = new TextPrompt(this.bindingsTextArea);
    static lastValue = this.bindingsTextArea.value;
    static isEditable = false;
    static doubledLetters = new Map([
        ["[", "]"],
        ["{", "}"],
        ['"', '"'],
        ["'", "'"],
        ["`", "`"],
        ["(", ")"],
    ]);
    static init() {
        this.bindingsTextArea.value = "";
        this.bindingsTextArea.placeholder = this.placeHolderBindings;
        this.bindingsTextArea.addEventListener("focus", () => {
            this.isBindingsTextAreaFocused = true;
        });
        this.bindingsTextArea.addEventListener("blur", () => {
            this.isBindingsTextAreaFocused = false;
            if (!this.BindingsTextPrompt.hovered)
                this.BindingsTextPrompt.detach();
        });
        this.bindingsTextArea.addEventListener("paste", (e) => {
            // Get pasted text from clipboard
            const pastedText = (e.clipboardData || window.clipboardData).getData("text");
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
        if ((startChar === "{" && endChar === "}") || (startChar === "[" && endChar === "]")) {
            e.preventDefault();
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
            this.editable(false);
            this.BindingsTextPrompt.detach();
            return;
        }
        this.editable(true);
        const selectedElementClass = GeneralUtil.elementToClassElement(selectedElement);
        const bindings = selectedElementClass.bindings;
        this.bindingsTextArea.value = bindings ?? "";
        // Updates the error message
        this.updateWarningLabel();
    }
    static editable(isEditable) {
        this.isEditable = isEditable;
        this.bindingsTextArea.readOnly = !isEditable;
    }
    static saveBindings() {
        if (this.bindingsTextArea.value === "") {
            this.errorMessage.style.visibility = "hidden";
            return;
        }
        const selectedElementClass = GeneralUtil.elementToClassElement(selectedElement);
        if (this.updateWarningLabel()) {
            selectedElementClass.bindings = this.bindingsTextArea.value;
        }
    }
    static updateWarningLabel() {
        try {
            const parsedBindings = JSON.parse(this.bindingsTextArea.value);
            this.errorMessage.style.visibility = "hidden";
            return true;
        }
        catch (e) {
            this.errorMessage.style.visibility = "visible";
            this.errorMessage.title = "Invalid JSON";
            return false;
        }
    }
    static handleKeyboardInput(e) {
        const start = this.bindingsTextArea.selectionStart;
        const end = this.bindingsTextArea.selectionEnd;
        const ta = this.bindingsTextArea;
        setTimeout(() => this.saveBindings(), 0);
        // Handles indentation
        if (e?.key == "Tab") {
            if (this.BindingsTextPrompt.attached) {
                this.BindingsTextPrompt.autoCorrectHighlightedText();
                e.preventDefault();
                return;
            }
            this.indent(e);
        }
        // Handles the opening of brackets and stops the text prompt when making a newline
        else if (e?.key == "Enter") {
            if (this.BindingsTextPrompt.attached) {
                this.BindingsTextPrompt.autoCorrectHighlightedText();
                e.preventDefault();
                return;
            }
            this.BindingsTextPrompt.detach();
            if (!this.tryOpenBrackets(e)) {
                const currentLineIndex = ta.value.substring(0, start).split("\n").length - 1;
                const lines = ta.value.split("\n");
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
        // Places double when used
        else if (this.doubledLetters.has(e?.key)) {
            e.preventDefault();
            const otherHalf = this.doubledLetters.get(e?.key);
            ta.value = ta.value.substring(0, start) + `${e?.key}${otherHalf}` + ta.value.substring(end);
            ta.selectionStart = ta.selectionEnd = start + 1;
        }
        // Mostly handles the text prompt and the target/source_property_names and binding_keys
        // doesnt use else if because " is also a double letter
        if (e?.key == '"' && ta.value[start - 2] != ":") {
            this.BindingsTextPrompt.attach();
            // Stores custom data
            this.BindingsTextPrompt.data.type = "binding_keys";
            this.BindingsTextPrompt.addTextOptions(binding_keys, this.insertBindingKey);
        }
        else if (e?.key == "#") {
            const source_property_names = collectSourcePropertyNames();
            this.BindingsTextPrompt.attach();
            // Stores custom data
            this.BindingsTextPrompt.data.type = "source_property_name";
            this.BindingsTextPrompt.addTextOptions(source_property_names, this.insertSourcePropertyName);
        }
        else if (e?.key == " " || e?.key == "ArrowRight" || e?.key == "ArrowLeft") {
            this.BindingsTextPrompt.detach();
        }
        else if (e?.key == "Backspace") {
            const charBefore = ta.value[start - 1];
            const otherHalf = charBefore ? this.doubledLetters.get(charBefore) : null;
            if (ta.value[start] == otherHalf && otherHalf) {
                e.preventDefault();
                ta.value = ta.value.substring(0, start - 1) + ta.value.substring(end + 1);
                ta.selectionStart = ta.selectionEnd = start - 1;
            }
            if (this.BindingsTextPrompt.attached) {
                if (this.BindingsTextPrompt.data.type == "binding_keys")
                    this.checkForDeletedChars('"');
                else if (this.BindingsTextPrompt.data.type == "source_property_name")
                    this.checkForDeletedChars("#");
            }
        }
        else if (e?.key == "ArrowDown") {
            if (this.BindingsTextPrompt.attached) {
                e.preventDefault();
                return this.BindingsTextPrompt.setHighlightedIndex(this.BindingsTextPrompt.highlightedIndex + 1);
            }
        }
        else if (e?.key == "ArrowUp") {
            if (this.BindingsTextPrompt.attached) {
                e.preventDefault();
                return this.BindingsTextPrompt.setHighlightedIndex(this.BindingsTextPrompt.highlightedIndex - 1);
            }
        }
        setTimeout(() => {
            if (!this.BindingsTextPrompt.attached)
                return;
            if (this.BindingsTextPrompt.data.type == "binding_keys")
                this.filterBindingKeys();
            if (this.BindingsTextPrompt.data.type == "source_property_name")
                this.filterSourcePropertyNames();
        }, 0);
    }
    static checkForDeletedChars(char) {
        const ta = this.bindingsTextArea;
        this.lastValue = ta.value;
        const regex = new RegExp(char, "g"); // <-- dynamically build regex
        const lastValueChars = this.lastValue.match(regex)?.length ?? 0;
        setTimeout(() => {
            const currentValueChars = ta.value.match(regex)?.length ?? 0;
            if (currentValueChars < lastValueChars) {
                this.BindingsTextPrompt.detach();
            }
        }, 0);
    }
    static filterSourcePropertyNames() {
        const currentHashtagValues = this.bindingsTextArea.value.substring(0, this.bindingsTextArea.selectionStart).split("#");
        if (currentHashtagValues.length === 0)
            return;
        const target_property_name = currentHashtagValues.at(-1);
        const searchedProps = GeneralUtil.searchWithPriority(target_property_name, collectSourcePropertyNames().map((n) => n.replace("#", "")));
        if (searchedProps.length === 0) {
            this.BindingsTextPrompt.promptBox.style.display = "none";
            return;
        }
        else {
            this.BindingsTextPrompt.promptBox.style.display = "block";
        }
        this.BindingsTextPrompt.addTextOptions(searchedProps.map((n) => `#${n}`), this.insertSourcePropertyName.bind(this));
    }
    static filterBindingKeys() {
        const currentSpeechMarkValues = this.bindingsTextArea.value.substring(0, this.bindingsTextArea.selectionStart).split('"');
        if (currentSpeechMarkValues.length === 0)
            return;
        const typedString = currentSpeechMarkValues.at(-1);
        const searchedProps = GeneralUtil.searchWithPriority(typedString, binding_keys);
        if (searchedProps.length === 0) {
            this.BindingsTextPrompt.promptBox.style.display = "none";
            return;
        }
        else {
            this.BindingsTextPrompt.promptBox.style.display = "block";
        }
        this.BindingsTextPrompt.addTextOptions(searchedProps, this.insertBindingKey.bind(this));
    }
    /**
     * Inserts a source property name into the BindingsTextArea at the current selection index.
     *
     * @param {string} textToInsert - The source property name to insert.
     * @returns {void}
     */
    static insertSourcePropertyName(textToInsert) {
        const ta = this.bindingsTextArea;
        const start = ta.selectionStart;
        const currentHashtagValues = ta.value.substring(0, start);
        if (currentHashtagValues.length === 0)
            return;
        const index = currentHashtagValues.lastIndexOf("#");
        // Clear the old value
        ta.value = ta.value.substring(0, index) + ta.value.substring(start);
        ta.value = ta.value.substring(0, index) + textToInsert + ta.value.substring(index);
        GeneralUtil.focusAt(ta, index + textToInsert.length);
    }
    /**
     * Inserts a binding key into the BindingsTextArea at the current selection index.
     *
     * @param {string} textToInsert - The binding key to insert.
     * @returns {void}
     */
    static insertBindingKey(textToInsert) {
        const ta = this.bindingsTextArea;
        const start = ta.selectionStart;
        const startText = ta.value.substring(0, start);
        const endText = ta.value.substring(start);
        if (startText.length === 0)
            return;
        const index = startText.lastIndexOf('"');
        const rightSideSpeechMark = endText.indexOf('"') + start;
        // Clear the speech marks of any in progress typing
        ta.value = ta.value.substring(0, index + 1) + ta.value.substring(rightSideSpeechMark);
        ta.value = ta.value.substring(0, index + 1) + textToInsert + ta.value.substring(index + 1);
        // Places a colon and speech marks after the binding key
        ta.value = ta.value.substring(0, index + textToInsert.length + 2) + ': ""' + ta.value.substring(index + textToInsert.length + 2);
        // Refocus in the newly places speech marks
        GeneralUtil.focusAt(ta, index + textToInsert.length + 5);
    }
}
//# sourceMappingURL=bindingsArea.js.map