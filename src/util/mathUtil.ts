export class MathUtil {

    /**
     * Clamps a value between 0 and 255. If the value is below 0, it returns 0.
     * If the value is above 255, it returns 255. Otherwise, it returns the value.
     * @param value The value to clamp.
     * @returns The clamped value.
     */
    public static clampToByte(value: number) {
        return Math.max(0, Math.min(255, value));
    }

    public static getDistanceVector2(vec1: [number, number], vec2: [number, number]): number {
        return Math.sqrt(Math.pow(vec1[0] - vec2[0], 2) + Math.pow(vec1[1] - vec2[1], 2));
    }

    public static getClosestPointVector2(point: [number, number], points: [number, number][]): [number, number] {
        let closestPoint: [number, number] = points[0]!;
        let closestDistance: number = Math.abs(point[0] - closestPoint[0]) + Math.abs(point[1] - closestPoint[1]);

        for (let i = 1; i < points.length; i++) {
            const distance: number = Math.abs(point[0] - points[i]![0]) + Math.abs(point[1] - points[i]![1]);
            if (distance < closestDistance) {
                closestPoint = points[i]!;
                closestDistance = distance;
            }
        }
        return closestPoint;
    }
}