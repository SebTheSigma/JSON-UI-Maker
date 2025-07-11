export interface JsonUISimpleElement {
    [key: string]: any;
    controls?: object[];
}
export declare const classToJsonUI: Map<string, (element: HTMLElement) => JsonUISimpleElement>;
