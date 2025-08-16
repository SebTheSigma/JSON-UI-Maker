import { isInMainWindow, panelContainer, selectedElement, setSelectedElement } from "../index.js";
import { config } from "../CONFIG.js";
import { updatePropertiesArea } from "../ui/propertiesArea.js";
import { AllJsonUIElements } from "./elements.js";
import { StringUtil } from "../util/stringUtil.js";
import { TextPrompt } from "../ui/textPrompt.js";
import { collectSourcePropertyNames } from "../scripter/bindings/source_property_name.js";
import { GeneralUtil } from "../util/generalUtil.js";
export class DraggableLabel {
    container;
    label;
    mirror;
    bindingsTextPrompt;
    focussed = false;
    isDragging;
    selected;
    offsetX;
    offsetY;
    hasShadow = false;
    shadowLabel;
    lastValue;
    shadowOffsetX;
    shadowOffsetY;
    bindings = "[]";
    /**
     * @param {HTMLElement} container
     */
    constructor(ID, container, labelOptions) {
        let lastParent = container;
        let i = 0;
        parent_loop: while (true) {
            if (!lastParent)
                break parent_loop;
            lastParent = lastParent.parentElement;
            i++;
        }
        // Saves parameters
        this._constructorArgs = [ID, container, labelOptions];
        this.container = container;
        this.shadowOffsetX = 6;
        this.shadowOffsetY = 6;
        const textAlign = labelOptions?.textAlign ?? "left";
        const fontSize = labelOptions?.fontScale ?? 1;
        const fontColor = labelOptions?.fontColor ?? [255, 255, 255];
        // Create the textarea
        this.label = document.createElement("textarea");
        this.label.value = labelOptions ? labelOptions.text : "";
        this.lastValue = this.label.value;
        this.label.className = "draggable-label";
        this.label.style.overflow = "hidden";
        this.label.style.resize = "none";
        this.label.style.minWidth = "10px";
        this.label.style.minHeight = "20px";
        this.label.style.maxWidth = `${panelContainer.getBoundingClientRect().width}px`;
        this.label.style.border = "2px solid black";
        this.label.style.font = "16px sans-serif";
        this.label.style.padding = "4px";
        this.label.wrap = "off";
        this.label.name = "label";
        this.label.style.color = "white";
        this.label.style.fontFamily = "MinecraftRegular";
        this.label.spellcheck = false;
        this.label.style.color = `rgb(${(fontColor[0], fontColor[1], fontColor[2])})`;
        // Create a hidden mirror for sizing
        this.mirror = document.createElement("div");
        this.mirror.style.position = "absolute";
        this.mirror.style.width = "fit-content";
        this.mirror.style.visibility = "hidden";
        this.mirror.style.whiteSpace = "pre-wrap";
        this.mirror.style.wordWrap = "break-word";
        this.mirror.style.font = this.label.style.font;
        this.mirror.style.fontFamily = this.label.style.fontFamily;
        this.mirror.style.padding = this.label.style.padding;
        this.mirror.style.border = this.label.style.border;
        this.mirror.style.boxSizing = "border-box";
        // Properties
        this.label.style.textAlign = textAlign;
        this.label.style.fontSize = `${fontSize}em`;
        this.mirror.style.textAlign = textAlign;
        this.mirror.style.fontSize = `${fontSize}em`;
        // Custom data
        this.label.dataset.id = ID;
        const parentRect = container.getBoundingClientRect();
        const rect = this.label.getBoundingClientRect();
        this.label.style.left = `${parentRect.width / 2}px`;
        this.label.style.top = `${parentRect.height / 2}px`;
        this.label.style.backgroundColor = "rgba(255, 255, 255, 0)";
        this.label.style.position = "absolute";
        this.label.style.zIndex = String(2 * i + 1);
        this.isDragging = false;
        this.selected = false;
        this.offsetX = 0;
        this.offsetY = 0;
        // Shadow label
        this.shadowLabel = document.createElement("div");
        this.shadowLabel.style.position = "absolute";
        this.shadowLabel.style.zIndex = String(2 * i);
        this.shadowLabel.style.color = "rgba(0, 0, 0, 0.5)";
        this.shadowLabel.style.display = "none";
        this.shadowLabel.style.fontFamily = this.label.style.fontFamily;
        this.shadowLabel.style.whiteSpace = "pre-wrap";
        this.shadowLabel.style.wordWrap = "break-word";
        const offset = config.magicNumbers.labelToOffset(this.label);
        this.shadowLabel.style.left = `${StringUtil.cssDimToNumber(this.label.style.left) + this.shadowOffsetX + offset[0]}px`;
        this.shadowLabel.style.top = `${StringUtil.cssDimToNumber(this.label.style.top) + this.shadowOffsetY + offset[1]}px`;
        this.container.appendChild(this.label);
        this.container.appendChild(this.mirror);
        this.container.appendChild(this.shadowLabel);
        if (labelOptions?.includeTextPrompt) {
            this.bindingsTextPrompt = new TextPrompt(this.label);
            this.bindingsTextPrompt.detach();
        }
        this.initEvents();
        this.grid(config.settings.show_grid.value);
    }
    updateSize(updateProperties = true) {
        const lines = this.label.value.split("\n");
        // If making a new line
        if (this.hasShadow) {
            if (lines.at(-1) === "")
                this.shadowLabel.style.display = "none";
            else
                this.shadowLabel.style.display = "block";
        }
        this.mirror.textContent = this.label.value || " ";
        this.shadowLabel.textContent = this.label.value || " ";
        if (collectSourcePropertyNames().includes(this.label.value)) {
            this.label.style.color = "rgb(0, 8, 255)";
        }
        else
            this.label.style.color = 'white';
        const mirrorRect = this.mirror.getBoundingClientRect();
        const scalar = parseFloat(this.label.style.fontSize);
        this.label.style.width = `${mirrorRect.width}px`;
        this.label.style.height = `${mirrorRect.height}px`;
        const offset = config.magicNumbers.labelToOffset(this.label);
        const labelRect = this.label.getBoundingClientRect();
        this.shadowLabel.style.width = `${labelRect.width}px`;
        this.shadowLabel.style.height = `${labelRect.height}px`;
        if (updateProperties)
            updatePropertiesArea();
        this.shadowLabel.style.left = `${StringUtil.cssDimToNumber(this.label.style.left) + this.shadowOffsetX + offset[0]}px`;
        this.shadowLabel.style.top = `${StringUtil.cssDimToNumber(this.label.style.top) + this.shadowOffsetY + offset[1]}px`;
    }
    initEvents() {
        this.label.addEventListener("mousedown", (e) => this.startDrag(e));
        this.label.addEventListener("dblclick", (e) => this.select(e));
        document.addEventListener("mousemove", (e) => this.drag(e));
        document.addEventListener("mouseup", () => this.stopDrag());
        // Initial size
        this.updateSize();
        // Auto-resize on input
        this.label.addEventListener("input", () => this.updateSize());
        if (this.bindingsTextPrompt) {
            this.label.addEventListener("focus", () => {
                this.focussed = true;
            });
            this.label.addEventListener("blur", () => {
                this.focussed = false;
                if (!this.bindingsTextPrompt.hovered)
                    this.bindingsTextPrompt?.detach();
            });
            window.addEventListener("keydown", (e) => {
                if (this.focussed)
                    this.handleKeyboardInput(e);
            });
        }
    }
    handleKeyboardInput(e) {
        const tp = this.bindingsTextPrompt;
        const ta = this.label;
        let key = e?.key;
        if (key == "Unidentified")
            key = "#";
        if (this.label.value[0] != "#" && !(key == "#" && this.label.value.length == 0)) {
            tp.detach();
            return;
        }
        if (key == "#") {
            tp.attach();
            const source_property_names = collectSourcePropertyNames();
            tp.addTextOptions(source_property_names, this.setStringAsPropName.bind(this));
        }
        else if (key == " " || key == "ArrowLeft" || key == "ArrowRight") {
            tp.detach();
        }
        else if (key == "Enter") {
            if (tp.attached) {
                tp.autoCorrectHighlightedText();
                e.preventDefault();
            }
            else {
                tp.detach();
            }
        }
        else if (key == "Tab") {
            if (tp.attached) {
                tp.autoCorrectHighlightedText();
                e.preventDefault();
            }
        }
        else if (key == "Backspace") {
            if (tp.attached) {
                this.lastValue = ta.value;
                const lastValueHashtags = this.lastValue.match(/#/g)?.length ?? 0;
                setTimeout(() => {
                    const currentValueHashtags = ta.value.match(/#/g)?.length ?? 0;
                    if (currentValueHashtags < lastValueHashtags)
                        tp.detach();
                }, 0);
            }
        }
        else if (tp.attached) {
            if (key == "ArrowUp") {
                e.preventDefault();
                this.bindingsTextPrompt?.setHighlightedIndex(this.bindingsTextPrompt.highlightedIndex - 1);
                return;
            }
            else if (key == "ArrowDown") {
                e.preventDefault();
                this.bindingsTextPrompt?.setHighlightedIndex(this.bindingsTextPrompt.highlightedIndex + 1);
                return;
            }
        }
        setTimeout(() => {
            if (!tp.attached)
                return;
            this.filterSourcePropertyNames();
        }, 0);
    }
    filterSourcePropertyNames() {
        const tp = this.bindingsTextPrompt;
        const currentHashtagValues = this.label.value.substring(0, this.label.selectionStart).split("#");
        if (currentHashtagValues.length === 0)
            return;
        const target_property_name = currentHashtagValues.at(-1);
        const searchedProps = GeneralUtil.searchWithPriority(target_property_name, collectSourcePropertyNames().map((n) => n.replace("#", "")));
        if (searchedProps.length === 0) {
            tp.promptBox.style.display = "none";
            return;
        }
        else {
            tp.promptBox.style.display = "block";
        }
        tp.addTextOptions(searchedProps.map((n) => `#${n}`), this.setStringAsPropName.bind(this));
    }
    /**
     * Sets the string as the property name of the label.
     *
     * @param {string} propName - The property name to set.
     * @return {void} This function does not return anything.
     */
    setStringAsPropName(propName) {
        const ta = this.label;
        ta.value = propName;
        GeneralUtil.focusAt(ta, propName.length);
        this.updateSize();
    }
    select(e) {
        e.stopPropagation(); // Prevent the event from bubbling up to the parent
        if (selectedElement) {
            if (selectedElement !== this.label) {
                selectedElement.style.border = "2px solid black";
                selectedElement.style.outline = "2px solid black";
                this.selected = true;
                setSelectedElement(this.label);
                this.label.style.border = "2px solid blue";
                this.label.style.outline = "2px solid blue";
                updatePropertiesArea();
                return;
            }
        }
        if (this.selected) {
            this.unSelect(e);
            return;
        }
        this.selected = true;
        setSelectedElement(this.label);
        this.label.style.border = "2px solid blue";
        this.label.style.outline = "2px solid blue";
        updatePropertiesArea();
        this.grid(config.settings.show_grid.value);
    }
    unSelect(_e) {
        this.selected = false;
        setSelectedElement(undefined);
        this.label.style.border = "2px solid black";
        this.label.style.outline = "2px solid black";
        updatePropertiesArea();
        this.grid(false);
    }
    startDrag(e) {
        // Stop propagation for nested elements
        for (let elementName of AllJsonUIElements) {
            if (this.container.classList.contains(elementName)) {
                e.stopPropagation();
            }
        }
        this.isDragging = true;
        // Get position relative to parent container
        const labelRect = this.label.getBoundingClientRect();
        this.offsetX = e.clientX - labelRect.left;
        this.offsetY = e.clientY - labelRect.top;
        this.label.style.cursor = "grabbing";
    }
    drag(e) {
        e.stopPropagation();
        if (!this.isDragging)
            return;
        const containerRect = this.container.getBoundingClientRect();
        if (config.settings.boundary_constraints.value) {
            let newLeft = e.clientX - containerRect.left - this.offsetX;
            let newTop = e.clientY - containerRect.top - this.offsetY;
            // Constrain to container bounds
            newLeft = Math.max(0, Math.min(newLeft, containerRect.width - this.label.offsetWidth));
            newTop = Math.max(0, Math.min(newTop, containerRect.height - this.label.offsetHeight));
            this.label.style.left = `${newLeft}px`;
            this.label.style.top = `${newTop}px`;
        }
        else {
            // Calculate position relative to parent container
            const newLeft = e.clientX - containerRect.left - this.offsetX;
            const newTop = e.clientY - containerRect.top - this.offsetY;
            this.label.style.left = `${newLeft}px`;
            this.label.style.top = `${newTop}px`;
        }
        const offset = config.magicNumbers.labelToOffset(this.label);
        this.shadowLabel.style.left = `${StringUtil.cssDimToNumber(this.label.style.left) + this.shadowOffsetX + offset[0]}px`;
        this.shadowLabel.style.top = `${StringUtil.cssDimToNumber(this.label.style.top) + this.shadowOffsetY + offset[1]}px`;
    }
    stopDrag() {
        this.isDragging = false;
        this.label.style.cursor = "grab";
        if (isInMainWindow)
            updatePropertiesArea();
    }
    setParse(shouldParse) {
        this.label.dataset.shouldParse = `${shouldParse}`.toLowerCase();
    }
    changeText(text) {
        this.label.textContent = text;
        this.mirror.textContent = text;
        this.shadowLabel.textContent = text;
    }
    getMainHTMLElement() {
        return this.label;
    }
    delete() {
        if (this.selected)
            this.unSelect();
        this.container.removeChild(this.label);
        this.container.removeChild(this.mirror);
        this.container.removeChild(this.shadowLabel);
        document.removeEventListener("mousemove", (e) => this.drag(e));
        document.removeEventListener("mouseup", () => this.stopDrag());
    }
    shadow(shouldShadow) {
        this.hasShadow = shouldShadow;
        this.shadowLabel.style.display = shouldShadow ? "block" : "none";
    }
    grid(showGrid) {
        const element = this.getMainHTMLElement();
        if (!showGrid) {
            element.style.removeProperty("--grid-cols");
            element.style.removeProperty("--grid-rows");
        }
        else {
            element.style.setProperty("--grid-cols", String(config.settings.grid_lock_columns.value));
            element.style.setProperty("--grid-rows", String(config.settings.grid_lock_rows.value));
        }
    }
}
//# sourceMappingURL=label.js.map