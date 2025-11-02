import { config } from "./CONFIG.js";
export class Nineslice {
    static ninesliceResize({ nineslice_size, base_size }, pixelArray, newWidth, newHeight) {
        const scale = config.magicNumbers.UI_SCALAR;
        console.warn(scale, "UI_SCALAR");
        // Normalize inputs
        const [left, top, right, bottom] = Array.isArray(nineslice_size) ? nineslice_size : [nineslice_size, nineslice_size, nineslice_size, nineslice_size];
        const [baseWidth, baseHeight] = Array.isArray(base_size) ? base_size : [base_size, base_size];
        const output = new Uint8ClampedArray(newWidth * newHeight * 4);
        function getPixel(x, y) {
            x = Math.max(0, Math.min(baseWidth - 1, Math.floor(x)));
            y = Math.max(0, Math.min(baseHeight - 1, Math.floor(y)));
            const idx = (y * baseWidth + x) * 4;
            return [pixelArray[idx] ?? 0, pixelArray[idx + 1] ?? 0, pixelArray[idx + 2] ?? 0, pixelArray[idx + 3] ?? 255];
        }
        function setPixel(x, y, rgba) {
            x = Math.floor(x);
            y = Math.floor(y);
            if (x < 0 || y < 0 || x >= newWidth || y >= newHeight)
                return;
            const idx = (y * newWidth + x) * 4;
            for (let i = 0; i < 4; i++)
                output[idx + i] = rgba[i];
        }
        function stretch(srcX, srcY, srcW, srcH, destX, destY, destW, destH) {
            destX = Math.round(destX);
            destY = Math.round(destY);
            destW = Math.max(0, Math.round(destW));
            destH = Math.max(0, Math.round(destH));
            if (destW <= 0 || destH <= 0)
                return;
            for (let y = 0; y < destH; y++) {
                const sampleY = srcH === 1 ? srcY : srcY + Math.floor((y * srcH) / destH);
                for (let x = 0; x < destW; x++) {
                    const sampleX = srcW === 1 ? srcX : srcX + Math.floor((x * srcW) / destW);
                    const pixel = getPixel(sampleX, sampleY);
                    setPixel(destX + x, destY + y, pixel);
                }
            }
        }
        // Calculate middle regions
        const midSrcW = baseWidth - left - right;
        const midSrcH = baseHeight - top - bottom;
        const scaledLeft = Math.round(left / scale);
        const scaledRight = Math.round(right / scale);
        const scaledTop = Math.round(top / scale);
        const scaledBottom = Math.round(bottom / scale);
        const midDestW = newWidth - scaledLeft - scaledRight;
        const midDestH = newHeight - scaledTop - scaledBottom;
        const rightDestX = scaledLeft + midDestW;
        const bottomDestY = scaledTop + midDestH;
        // --- NINE SECTIONS ---
        // Top row
        stretch(0, 0, left, top, 0, 0, scaledLeft, scaledTop); // top-left
        stretch(left, 0, midSrcW, top, scaledLeft, 0, midDestW, scaledTop); // top-mid
        stretch(baseWidth - right, 0, right, top, rightDestX, 0, scaledRight, scaledTop); // top-right
        // Middle row
        stretch(0, top, left, midSrcH, 0, scaledTop, scaledLeft, midDestH); // mid-left
        stretch(left, top, midSrcW, midSrcH, scaledLeft, scaledTop, midDestW, midDestH); // center
        stretch(baseWidth - right, top, right, midSrcH, rightDestX, scaledTop, scaledRight, midDestH); // mid-right
        // Bottom row
        stretch(0, baseHeight - bottom, left, bottom, 0, bottomDestY, scaledLeft, scaledBottom); // bottom-left
        stretch(left, baseHeight - bottom, midSrcW, bottom, scaledLeft, bottomDestY, midDestW, scaledBottom); // bottom-mid
        stretch(baseWidth - right, baseHeight - bottom, right, bottom, rightDestX, bottomDestY, scaledRight, scaledBottom); // bottom-right
        return output;
    }
}
//# sourceMappingURL=nineslice.js.map