import { SavedConfig, StringObjectMap } from "./converter.js";
import { GlobalElementMapValue } from "./index.js";
interface UploadTreeInstructions {
    ContinuePath: boolean;
    SkipToNextJsonNode?: boolean;
    FollowPath?: string;
}
export declare class FormUploader {
    static parseJsonWithComments(raw: string): any;
    static isValid(form: string): boolean;
    static getJsonControlsAndType(json: StringObjectMap): {
        control: StringObjectMap;
        type: string;
    }[];
    static uploadForm(form: string): void;
    static tree(rootJson: StringObjectMap, parentClassElement: GlobalElementMapValue, args?: any): void;
}
export declare const tagNameToCreateClassElementFunc: Map<string, (json: StringObjectMap, parentClassElement: GlobalElementMapValue, usedConfig: SavedConfig, nextNodes: StringObjectMap) => {
    element: GlobalElementMapValue;
    instructions: UploadTreeInstructions;
} | undefined>;
export {};
