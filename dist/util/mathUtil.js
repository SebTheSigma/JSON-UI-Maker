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
    static getDistanceVector2(vec1, vec2) {
        return Math.sqrt(Math.pow(vec1[0] - vec2[0], 2) + Math.pow(vec1[1] - vec2[1], 2));
    }
    static getClosestPointVector2(point, points) {
        let closestPoint = points[0];
        let closestDistance = Math.abs(point[0] - closestPoint[0]) + Math.abs(point[1] - closestPoint[1]);
        for (let i = 1; i < points.length; i++) {
            const distance = Math.abs(point[0] - points[i][0]) + Math.abs(point[1] - points[i][1]);
            if (distance < closestDistance) {
                closestPoint = points[i];
                closestDistance = distance;
            }
        }
        return closestPoint;
    }
}
//# sourceMappingURL=mathUtil.js.map