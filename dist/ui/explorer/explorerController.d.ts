import { GlobalElementMapValue } from "../../index.js";
export declare class ExplorerController {
    static constructTextElement(text: string, hasChildren: boolean): HTMLDivElement;
    static updateExplorer(): void;
    static reset(): void;
    static tree(classElement: GlobalElementMapValue, lastTextElement: HTMLDivElement, depth?: number): void;
    static selectedElementUpdate(): void;
}
