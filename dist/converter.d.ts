import { JsonUISimpleElement } from "./converterTypes/HTMLClassToJonUITypes.js";
export interface TreeInstructions {
    ContinuePath: boolean;
    CommonElementLink?: string;
    NewTreeFromBaseNode?: boolean;
}
export interface TreeData {
    element?: JsonUISimpleElement;
    instructions?: TreeInstructions;
}
interface StringObjectMap {
    [key: string]: object | string;
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
    static nodeToJsonUI(node: HTMLElement, nameSpace: string): TreeData | undefined;
    /**
     * Goes down the tree of nodes to develop the json-ui file
     * @param startNodeTree The node to start generating the json-ui from
     * @returns A JSON object with the json-ui
     */
    static tree(startNodeTree: Node, depth: number | undefined, baseNode: Node, nameSpace?: string): StringObjectMap;
    /**
     * Recursively traverses the tree of nodes to generate the json-ui structure.
     * @param node The starting node for generating the json-ui structure.
     * @param depth The current depth of the node in the tree, defaults to 0.
     * @returns A JSON object representing the json-ui structure.
     */
    static test(node: Node, depth?: number): StringObjectMap;
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
