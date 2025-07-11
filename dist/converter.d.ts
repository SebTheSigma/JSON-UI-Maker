interface StringObjectMap {
    [key: string]: object | string;
}
export interface JsonUISimpleElement {
    [key: string]: any;
    controls?: object[];
}
export declare class Converter {
    /**
     * Gets all of the nodes currently in the main window
     * @returns An array of all the nodes in the main window
     */
    static getAllNodes(): Node[];
    /**
     * Goes down the tree of nodes to develop the json-ui file
     * @param startNodeTree The node to start generating the json-ui from
     * @returns A JSON object with the json-ui
     */
    static nodeToJsonUI(node: HTMLElement): JsonUISimpleElement | undefined;
    /**
     * Goes down the tree of nodes to develop the json-ui file
     * @param startNodeTree The node to start generating the json-ui from
     * @returns A JSON object with the json-ui
     */
    static test(startNodeTree: Node, depth?: number, nameSpace?: string): StringObjectMap;
    /**
     * Generates a random string of a specified length.
     * The string consists of lowercase letters and digits.
     *
     * @param length The desired length of the generated string.
     * @returns A random string of the specified length.
     */
    static generateRandomString(length: number): string;
}
export {};
