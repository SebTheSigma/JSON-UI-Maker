export declare const propertiesMap: Map<string, {
    type: string;
    displayName: string;
    editable: boolean;
    get: (element: HTMLElement) => string | undefined;
    set: (element: HTMLElement, value: string) => void;
}[] | ({
    type: string;
    displayName: string;
    editable: boolean;
    get: (element: HTMLElement) => string;
    set: (element: HTMLElement, value: string) => void;
} | {
    type: string;
    displayName: string;
    editable: boolean;
    get: (element: HTMLElement) => boolean;
    set: (element: HTMLElement) => false | void;
})[]>;
export declare function updatePropertiesArea(): void;
