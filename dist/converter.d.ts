export declare class Converter {
    static getAllNodes(): Node[];
    static nodeToJsonUI(node: HTMLElement): object;
    static test(startNodeTree: Node): StringObjectMap;
    static generateRandomString(length: number): string;
}
interface StringObjectMap {
    [key: string]: object;
}
export {};
