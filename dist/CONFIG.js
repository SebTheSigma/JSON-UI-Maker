export const config = {
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
        getFontScaledOffsetY: (fontSize) => 2 * fontSize - 2,
        UI_SCALAR: 0.5,
        buttonImageOffsetX: 2,
        buttonImageOffsetY: 2
    },
    nameSpace: 'main',
    defaultCollectionName: 'form_buttons'
};
//# sourceMappingURL=CONFIG.js.map