declare const configSettings: {
    boundary_constraints: {
        type: string;
        editable: boolean;
        value: boolean;
        displayName: string;
    };
    arrow_key_move_amount: {
        type: string;
        editable: boolean;
        value: number;
        displayName: string;
    };
    grid_lock_rows: {
        type: string;
        editable: boolean;
        value: number;
        displayName: string;
        onchange: (value: number) => void;
    };
    grid_lock_columns: {
        type: string;
        editable: boolean;
        value: number;
        displayName: string;
        onchange: (value: number) => void;
    };
    grid_lock_radius: {
        type: string;
        editable: boolean;
        value: number;
        displayName: string;
    };
    grid_lock: {
        type: string;
        editable: boolean;
        value: boolean;
        displayName: string;
        onchange: (value: boolean) => void;
    };
    show_grid: {
        type: string;
        editable: boolean;
        value: boolean;
        displayName: string;
        onchange: (value: boolean) => void;
    };
    element_outline: {
        type: string;
        editable: boolean;
        value: number;
        displayName: string;
        onchange: (value: number) => void;
    };
    selected_element_children_get_copied: {
        type: string;
        editable: boolean;
        value: boolean;
        displayName: string;
    };
};
declare const configMagicNumbers: {
    textEditor: {
        indentation: number;
    };
    explorer: {
        folderIndentation: number;
        nonFolderIndentation: number;
        overallOffset: number;
    };
    resizeHandleSize: number;
    fontScalar: number;
    fontOffsetX: number;
    fontOffsetY: number;
    getFontScaledOffsetY: (fontSize: number, fontType: string) => number;
    UI_SCALAR: number;
    buttonImageOffsetX: number;
    buttonImageOffsetY: number;
    labelToOffset: (label: HTMLTextAreaElement) => [number, number];
};
interface Config {
    settings: typeof configSettings;
    magicNumbers: typeof configMagicNumbers;
    nameSpace: string;
    title_flag: string;
    defaultCollectionName: string;
    rootElement?: HTMLElement;
    texturePresets?: {
        [key: string]: boolean;
    };
    zoom: number;
}
export declare const config: Config;
export {};
