import { CopiedElementData } from "./copy.js";
export declare const pasteConversionMap: Map<string, (copiedElement: CopiedElementData, parent: HTMLElement, isChild?: boolean) => void | undefined>;
export declare class Paster {
    static paste(): void;
}
