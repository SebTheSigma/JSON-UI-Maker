import { config } from "./CONFIG.js";
import { JsonUISimpleElement } from "./converterTypes/HTMLClassToJonUITypes.js";
export interface TreeInstructions {
    ContinuePath: boolean;
    CommonElementLink?: string;
    NewTree?: {
        link: string;
        startingNode: string;
    };
    Warning?: {
        message: string;
    };
}
export interface TreeData {
    element?: JsonUISimpleElement;
    instructions?: TreeInstructions;
}
export interface StringObjectMap {
    [key: string]: object | string | [] | number;
}
export declare class Converter {
    /**
     * Goes down the tree of nodes to develop the json-ui file
     * @param startNodeTree The node to start generating the json-ui from
     * @returns A JSON object with the json-ui
     */
    static nodeToJsonUI(node: HTMLElement, nameSpace: string): TreeData | undefined;
    /**
     * Recursively traverses the tree of nodes to generate the json-ui structure.
     * Uses skip and continue attributes to control the flow of the tree.
     * Uses the NewTree and CommonElementLink attributes to control the flow of the tree.
     * Can choose whether to parse the node or not.
     *
     * @param startNodeTree The starting node for generating the json-ui structure.
     * @param depth The current depth of the node in the tree, defaults to 0.
     * @param nameSpace The namespace for the json-ui, defaults to the one specified in the CONFIG.
     * @param _baseJsonUiNode The base node for the json-ui, defaults to an empty node.
     * @param _nodeLink The link to the node, defaults to an empty string.
     * @returns A JSON object representing the json-ui structure.
     */
    static tree(startNodeTree: Node, depth?: number, nameSpace?: string, _baseJsonUiNode?: JsonUISimpleElement): StringObjectMap;
    /**
     * Recursively traverses the tree of nodes to generate the json-ui structure.
     * @param node The starting node for generating the json-ui structure.
     * @param depth The current depth of the node in the tree, defaults to 0.
     * @returns A JSON object representing the json-ui structure.
     */
    static convertToJsonUi(node: Node, depth?: number): string;
}
export interface SavedConfig {
    magicNumbers: typeof config.magicNumbers;
}
