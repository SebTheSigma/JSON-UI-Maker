export declare class StringUtil {
    /**
     * Converts a string representing a css dimension into a number.
     * @example "100px" => 100
     * @param {string} value
     * @returns {number}
     */
    static cssDimToNumber(value: string): number;
    /**
     * Generates a random string of a specified length.
     * The string consists of lowercase letters and digits.
     *
     * @param length The desired length of the generated string.
     * @returns A random string of the specified length.
     */
    static generateRandomString(length: number): string;
    /**
     * Returns a string that is the filename without its extension.
     *
     * If the filename does not have an extension, the filename is returned as is.
     *
     * @param filename The filename to remove the extension from.
     * @returns The filename without its extension.
     */
    static removeFileExtension(filename: string): string;
}
