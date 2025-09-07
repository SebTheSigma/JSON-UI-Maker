export declare class MathUtil {
    /**
     * Clamps a value between 0 and 255. If the value is below 0, it returns 0.
     * If the value is above 255, it returns 255. Otherwise, it returns the value.
     * @param value The value to clamp.
     * @returns The clamped value.
     */
    static clampToByte(value: number): number;
    static getDistanceVector2(vec1: [number, number], vec2: [number, number]): number;
    static getClosestPointVector2(point: [number, number], points: [number, number][]): [number, number];
}
