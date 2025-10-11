import { panelContainer } from "../index.js";
import { config } from "../CONFIG.js";
import { updatePropertiesArea } from "../ui/propertiesArea.js";
import { StringUtil } from "../util/stringUtil.js";
import { TextPrompt } from "../ui/textPrompt.js";
import { collectSourcePropertyNames } from "../scripter/bindings/source_property_name.js";
import { GeneralUtil } from "../util/generalUtil.js";
import { ElementSharedFuncs } from "./sharedElement.js";
import { ExplorerController } from "../ui/explorer/explorerController.js";
export class DraggableLabel {
    // Core elements
    container;
    label;
    mirror;
    shadowLabel;
    // UI helpers
    bindingsTextPrompt;
    // State flags
    focussed = false;
    isDragging = false;
    selected = false;
    deleteable = true;
    hasShadow = false;
    // Positioning & movement
    offsetX = 0;
    offsetY = 0;
    shadowOffsetX = 6;
    shadowOffsetY = 6;
    // Data
    lastValue;
    bindings = "";
    /**
     * @param {HTMLElement} container
     */
    constructor(ID, container, labelOptions) {
        const i = GeneralUtil.getElementDepth(container, panelContainer);
        // Saves parameters
        this._constructorArgs = [ID, container, labelOptions];
        this.container = container;
        const parentRect = container.getBoundingClientRect();
        const textAlign = labelOptions?.textAlign ?? "left";
        const fontSize = labelOptions?.fontScale ?? 1;
        const fontColor = labelOptions?.fontColor ?? [255, 255, 255];
        // Create the textarea
        this.label = document.createElement("textarea");
        this.label.value = labelOptions ? labelOptions.text : "";
        this.label.style.visibility = "visible";
        this.label.className = "draggable-label";
        this.label.style.overflow = "hidden";
        this.label.style.resize = "none";
        this.label.style.minWidth = "10px";
        this.label.style.minHeight = "20px";
        this.label.style.maxWidth = `${panelContainer.getBoundingClientRect().width}px`;
        this.label.style.outline = `${config.settings.element_outline.value}px solid black`;
        this.label.style.font = "16px sans-serif";
        this.label.style.padding = "4px";
        this.label.wrap = "off";
        this.label.name = "label";
        this.label.style.color = "white";
        this.label.style.fontFamily = "MinecraftRegular";
        this.label.spellcheck = false;
        this.label.style.color = `rgb(${(fontColor[0], fontColor[1], fontColor[2])})`;
        this.label.style.textAlign = textAlign;
        this.label.style.fontSize = `${fontSize}em`;
        this.label.style.left = `${parentRect.width / 2}px`;
        this.label.style.top = `${parentRect.height / 2}px`;
        this.label.style.backgroundColor = "rgba(255, 255, 255, 0)";
        this.label.style.position = "absolute";
        this.label.style.zIndex = String(2 * i + 1);
        this.label.dataset.id = ID;
        this.lastValue = this.label.value;
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
        this.mirror.style.outline = this.label.style.outline;
        this.mirror.style.boxSizing = "border-box";
        this.mirror.style.textAlign = textAlign;
        this.mirror.style.fontSize = `${fontSize}em`;
        this.mirror.textContent = this.label.value;
        const offset = config.magicNumbers.labelToOffset(this.label);
        // Shadow label
        this.shadowLabel = document.createElement("div");
        this.shadowLabel.style.visibility = "visible";
        this.shadowLabel.style.position = "absolute";
        this.shadowLabel.style.zIndex = String(2 * i);
        this.shadowLabel.style.color = "rgba(0, 0, 0, 0.5)";
        this.shadowLabel.style.display = "none";
        this.shadowLabel.style.fontFamily = this.label.style.fontFamily;
        this.shadowLabel.style.whiteSpace = "pre-wrap";
        this.shadowLabel.style.wordWrap = "break-word";
        this.shadowLabel.style.fontSize = `${fontSize}em`;
        this.shadowLabel.style.textAlign = textAlign;
        this.shadowLabel.textContent = this.label.value;
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
        setTimeout(() => {
            ExplorerController.updateExplorer();
        }, 0);
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
            this.label.style.color = "white";
        const mirrorRect = this.mirror.getBoundingClientRect();
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
        ElementSharedFuncs.select(e, this);
    }
    unSelect(_e) {
        ElementSharedFuncs.unSelect(this);
    }
    startDrag(e) {
        ElementSharedFuncs.startDrag(e, this);
    }
    drag(e) {
        if (!this.isDragging)
            return;
        ElementSharedFuncs.drag(e, this);
        const offset = config.magicNumbers.labelToOffset(this.label);
        this.shadowLabel.style.left = `${StringUtil.cssDimToNumber(this.label.style.left) + this.shadowOffsetX + offset[0]}px`;
        this.shadowLabel.style.top = `${StringUtil.cssDimToNumber(this.label.style.top) + this.shadowOffsetY + offset[1]}px`;
    }
    stopDrag() {
        ElementSharedFuncs.stopDrag(this);
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
        if (!this.deleteable)
            return;
        if (this.selected)
            this.unSelect();
        this.container.removeChild(this.label);
        this.container.removeChild(this.mirror);
        this.container.removeChild(this.shadowLabel);
        if (this.bindingsTextPrompt)
            this.bindingsTextPrompt.delete();
        this.detach();
    }
    shadow(shouldShadow) {
        this.hasShadow = shouldShadow;
        this.shadowLabel.style.display = shouldShadow ? "block" : "none";
    }
    detach() {
        window.removeEventListener("keydown", (e) => {
            if (this.focussed)
                this.handleKeyboardInput(e);
        });
    }
    hide() {
        this.shadowLabel.style.visibility = "hidden";
        ElementSharedFuncs.hide(this);
    }
    show() {
        this.shadowLabel.style.visibility = "visible";
        ElementSharedFuncs.show(this);
    }
}
//# sourceMappingURL=label.js.map