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
        resizeHandleSize: 15,
        fontScalar: 1.6,
        fontOffsetX: 6,
        fontOffsetY: 6,
        getFontScaledOffsetY: (fontSize) => 2 * fontSize - 2,
        UI_SCALAR: 0.5,
        buttonImageOffsetX: 2,
        buttonImageOffsetY: 2,
        labelToOffset: (label) => {
            const fontToScalingFuncMap = new Map([
                ['MinecraftRegular', (element) => {
                        const fontSize = parseFloat(element.style.fontSize ?? '1');
                        let offsetX = fontSize * 1.5;
                        let offsetY = offsetX;
                        if (element.style.textAlign == 'center') {
                            offsetX -= 5;
                        }
                        else if (element.style.textAlign == 'right') {
                            offsetX -= 10;
                        }
                        return [offsetX, offsetY];
                    }],
                ['MinecraftTen', (element) => {
                        let offsetX = parseFloat(element.style.fontSize ?? '1') * 2.5;
                        return [offsetX, offsetX];
                    }],
            ]);
            const func = fontToScalingFuncMap.get(label.style.fontFamily ?? 'MinecraftRegular');
            if (!func)
                throw new Error(`Font fontSizeToOffset function not found for ${label.style.fontFamily ?? 'MinecraftRegular'}`);
            const offset = func(label);
            return offset;
        },
    },
    nameSpace: 'main',
    defaultCollectionName: 'form_buttons'
};
//# sourceMappingURL=CONFIG.js.map