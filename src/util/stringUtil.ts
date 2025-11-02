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

    /**
     * Generates a random string of a specified length.
     * The string consists of lowercase letters and digits.
     *
     * @param length The desired length of the generated string.
     * @returns A random string of the specified length.
     */
    public static generateRandomString(length: number): string {
        let result = "";
        const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    /**
     * Returns a string that is the filename without its extension.
     *
     * If the filename does not have an extension, the filename is returned as is.
     *
     * @param filename The filename to remove the extension from.
     * @returns The filename without its extension.
     */
    public static removeFileExtension(filename: string) {
        const lastDot = filename.lastIndexOf(".");
        if (lastDot === -1) return filename; // No dot
        return filename.slice(0, lastDot);
    }
}
