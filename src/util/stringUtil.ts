export class StringUtil {
    /**
     * Converts a string representing a css dimension into a number.
     * @example "100px" => 100
     * @param {string} value
     * @returns {number}
     */
    public static cssDimToNumber(value: string): number {
        return Number(value.replace("px", ""));
    }
}