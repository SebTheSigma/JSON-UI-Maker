import { TreeData } from "../converter.js";
export interface JsonUISimpleElement {
    [key: string]: any;
    controls?: object[];
}
export declare const classToJsonUI: Map<string, (element: HTMLElement, nameSpace: string) => TreeData>;
