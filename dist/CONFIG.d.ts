interface Setting {
    type: string;
    editable: boolean;
    value: any;
    displayName?: string;
}
export declare const config: {
    settings: {
        [key: string]: Setting;
    };
    nameSpace: string;
    magicNumbers: {
        [key: string]: number;
    };
};
export {};
