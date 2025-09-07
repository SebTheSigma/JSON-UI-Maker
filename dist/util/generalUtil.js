import { GLOBAL_ELEMENT_MAP } from "../index.js";
export class GeneralUtil {
    static getElementDepth(el, stopsAtElement = null) {
        let depth = 0;
        while (el) {
            if (el === stopsAtElement)
                return depth;
            if (el.dataset.skip !== "true") {
                depth++;
            }
            el = el.parentElement;
        }
        return depth;
    }
    static elementToClassElement(element) {
        const id = element.dataset.id;
        return GLOBAL_ELEMENT_MAP.get(id);
    }
    static idToClassElement(id) {
        return GLOBAL_ELEMENT_MAP.get(id);
    }
    static getCaretScreenPosition(textarea) {
        const style = getComputedStyle(textarea);
        const div = document.createElement("div");
        // Copy all computed styles
        Array.from(style).forEach((prop) => {
            div.style.setProperty(prop, style.getPropertyValue(prop), style.getPropertyPriority(prop));
        });
        // Adjust styling for accurate measurement
        div.style.position = "absolute";
        div.style.visibility = "hidden";
        div.style.overflow = "visible"; // let text flow beyond
        // Match textarea's inner width (content box)
        div.style.width = `${textarea.clientWidth}px`;
        // Put the text up to the caret
        const value = textarea.value.substring(0, textarea.selectionStart);
        div.textContent = value;
        // Add a marker for caret
        const span = document.createElement("span");
        span.textContent = "\u200b"; // zero-width space
        div.appendChild(span);
        document.body.appendChild(div);
        // Measure positions
        const mirrorRect = div.getBoundingClientRect();
        const spanRect = span.getBoundingClientRect();
        const textareaRect = textarea.getBoundingClientRect();
        // Position inside textarea (before adding page scroll)
        const relativeTop = spanRect.top - mirrorRect.top - textarea.scrollTop;
        const relativeLeft = spanRect.left - mirrorRect.left - textarea.scrollLeft;
        // Final coordinates in page space
        const coords = {
            top: textareaRect.top + relativeTop + window.scrollY,
            left: textareaRect.left + relativeLeft + window.scrollX,
        };
        document.body.removeChild(div);
        return coords;
    }
    static searchWithPriority(query, items) {
        const q = query.toLowerCase();
        return items
            .map((item) => {
            const lower = item.toLowerCase();
            let score = Infinity;
            if (lower === q) {
                score = 0; // exact match
            }
            else if (lower.startsWith(q)) {
                score = 1; // starts with
            }
            else {
                const index = lower.indexOf(q);
                if (index !== -1) {
                    if (/\b/.test(lower[index - 1] || "")) {
                        score = 2; // word boundary
                    }
                    else {
                        score = 3; // substring
                    }
                    // small tie-breaker for earlier match
                    score += index / 100;
                }
            }
            return { item, score };
        })
            .filter((res) => res.score !== Infinity)
            .sort((a, b) => a.score - b.score)
            .map((res) => res.item);
    }
    static focusAt(textarea, index) {
        textarea.focus();
        // Move caret to the given index
        textarea.setSelectionRange(index, index);
    }
    static loopClamp(value, max) {
        return ((value % max) + max) % max;
    }
    static isOutOfScrollView(el, container) {
        const elRect = el.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        return elRect.top < containerRect.top ||
            elRect.left < containerRect.left ||
            elRect.bottom > containerRect.bottom ||
            elRect.right > containerRect.right;
    }
    static tryParseBindings(bindings) {
        try {
            return JSON.parse(bindings);
        }
        catch {
            return;
        }
    }
    /**
     * Determine whether the given `input` is iterable.
     *
     * @returns {Boolean}
     */
    static isIterable(input) {
        if (input === null || input === undefined) {
            return false;
        }
        return typeof input[Symbol.iterator] === 'function';
    }
}
//# sourceMappingURL=generalUtil.js.map