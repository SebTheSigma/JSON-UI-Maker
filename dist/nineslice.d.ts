export interface NinesliceData {
    nineslice_size: [left: number, top: number, right: number, bottom: number];
    base_size: [width: number, height: number];
}
export declare class Nineslice {
    static ninesliceResize({ nineslice_size, base_size }: NinesliceData, pixelArray: Uint8ClampedArray<ArrayBufferLike>, newWidth: number, newHeight: number): Uint8ClampedArray<ArrayBuffer>;
}
