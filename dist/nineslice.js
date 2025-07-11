export class Nineslice {
    static ninesliceResize({ nineslice_size, base_size }, pixelArray, newWidth, newHeight) {
        const [left, top, right, bottom] = nineslice_size;
        const [baseWidth, baseHeight] = base_size;
        const output = new Uint8ClampedArray(newWidth * newHeight * 4);
        function getPixel(x, y) {
            x = Math.max(0, Math.min(baseWidth - 1, x));
            y = Math.max(0, Math.min(baseHeight - 1, y));
            const idx = (y * baseWidth + x) * 4;
            return [pixelArray[idx] ?? 0, pixelArray[idx + 1] ?? 0, pixelArray[idx + 2] ?? 0, pixelArray[idx + 3] ?? 255];
        }
        function setPixel(x, y, rgba) {
            if (x < 0 || y < 0 || x >= newWidth || y >= newHeight)
                return;
            const idx = (y * newWidth + x) * 4;
            for (let i = 0; i < 4; i++) {
                output[idx + i] = rgba[i];
            }
        }
        function stretch(srcX, srcY, srcW, srcH, destX, destY, destW, destH) {
            for (let y = 0; y < destH; y++) {
                const sampleY = srcH === 1 ? srcY : srcY + Math.floor((y * srcH) / destH);
                for (let x = 0; x < destW; x++) {
                    const sampleX = srcW === 1 ? srcX : srcX + Math.floor((x * srcW) / destW);
                    const pixel = getPixel(sampleX, sampleY);
                    setPixel(destX + x, destY + y, pixel);
                }
            }
        }
        // Calculate middle region sizes
        const midSrcW = baseWidth - left - right;
        const midSrcH = baseHeight - top - bottom;
        const midDestW = newWidth - left - right;
        const midDestH = newHeight - top - bottom;
        // Top-left corner
        stretch(0, 0, left, top, 0, 0, left, top);
        // Top-middle edge
        stretch(left, 0, midSrcW, top, left, 0, midDestW, top);
        // Top-right corner
        stretch(baseWidth - right, 0, right, top, newWidth - right, 0, right, top);
        // Middle-left edge
        stretch(0, top, left, midSrcH, 0, top, left, midDestH);
        // Center
        stretch(left, top, midSrcW, midSrcH, left, top, midDestW, midDestH);
        // Middle-right edge
        stretch(baseWidth - right, top, right, midSrcH, newWidth - right, top, right, midDestH);
        // Bottom-left corner
        stretch(0, baseHeight - bottom, left, bottom, 0, newHeight - bottom, left, bottom);
        // Bottom-middle edge
        stretch(left, baseHeight - bottom, midSrcW, bottom, left, newHeight - bottom, midDestW, bottom);
        // Bottom-right corner
        stretch(baseWidth - right, baseHeight - bottom, right, bottom, newWidth - right, newHeight - bottom, right, bottom);
        return output;
    }
}
//# sourceMappingURL=nineslice.js.map