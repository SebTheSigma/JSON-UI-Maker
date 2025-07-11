export class StringUtil {
    /**
     * Converts a string representing a css dimension into a number.
     * @example "100px" => 100
     * @param {string} value
     * @returns {number}
     */
    static cssDimToNumber(value) {
        return Number(value.replace("px", ""));
    }
}
//# sourceMappingURL=stringUtil.js.map