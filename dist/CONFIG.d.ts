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
    };
    magicNumbers: {
        fontScalar: number;
        fontOffsetX: number;
        fontOffsetY: number;
        getFontScaledOffsetY: (fontSize: number) => number;
        UI_SCALAR: number;
        buttonImageOffsetX: number;
        buttonImageOffsetY: number;
    };
    nameSpace: string;
    defaultCollectionName: string;
};
