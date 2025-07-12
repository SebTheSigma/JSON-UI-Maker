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
};
export {};
