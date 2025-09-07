import { GlobalElementMapValue } from "../index.js";
import { CopiedElementData } from "./copy.js";
export declare const pasteConversionMap: Map<string, (copiedElement: CopiedElementData, parent: HTMLElement) => GlobalElementMapValue | undefined>;
export declare class Paster {
    static paste(): void;
}
