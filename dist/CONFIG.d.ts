export declare const config: {
    settings: {
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
    };
    magicNumbers: {
        textEditor: {
            indentation: number;
        };
        resizeHandleSize: number;
        fontScalar: number;
        fontOffsetX: number;
        fontOffsetY: number;
        getFontScaledOffsetY: (fontSize: number) => number;
        UI_SCALAR: number;
        buttonImageOffsetX: number;
        buttonImageOffsetY: number;
        labelToOffset: (label: HTMLTextAreaElement) => [number, number];
    };
    nameSpace: string;
    title: string;
    defaultCollectionName: string;
};
