export class MathUtil {
    /**
     * Clamps a value between 0 and 255. If the value is below 0, it returns 0.
     * If the value is above 255, it returns 255. Otherwise, it returns the value.
     * @param value The value to clamp.
     * @returns The clamped value.
     */
    static clampToByte(value) {
        return Math.max(0, Math.min(255, value));
    }
}
//# sourceMappingURL=mathUtil.js.map