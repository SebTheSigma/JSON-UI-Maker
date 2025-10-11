import { GlobalElementMapValue } from "../index.js";
export interface CopiedElementData {
    [key: string]: any;
    children?: CopiedElementData[];
}
export declare const conversionMap: Map<string, (elementClass: GlobalElementMapValue) => CopiedElementData | undefined>;
export declare class Copier {
    static copyElement(id: string): void;
}
