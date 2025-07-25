
interface Setting {
    type: string;
    editable: boolean;
    value: any;
    displayName?: string;
}

export const config: { settings: { [key: string]: Setting }, nameSpace: string, magicNumbers: { [key: string]: number } } = {
    settings: {
        boundary_constraints: {
            type: "checkbox",
            editable: true,
            value: false,
            displayName: "Boundary Constraints",
        },
        arrow_key_move_amount: {
            type: "number",
            editable: true,
            value: 10,
            displayName: "Arrow Key Move Amount",
        }
    },
    magicNumbers: {
        fontScalar: 1.6,
        fontOffsetX: 6,
        fontOffsetY: 6, 
        UI_SCALAR: 0.5,
        buttonImageOffsetX: 2,
        buttonImageOffsetY: 2
    },
    nameSpace: 'main'
};
