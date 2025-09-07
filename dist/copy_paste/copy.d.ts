import { GlobalElementMapValue } from "../index.js";
export interface CopiedElementData {
    [key: string]: any;
}
export declare const conversionMap: Map<string, (elementClass: GlobalElementMapValue) => CopiedElementData | undefined>;
export declare class Copier {
    static copyElement(): void;
}
