import { FileUploader } from "./openFiles.js";
export async function initDefaultImages() {
    const placeholderImage = await FileUploader.getAssetAsFile('assets/placeholder.webp', 'placeholder.webp');
    const placeholderJson = await FileUploader.getAssetAsFile('assets/placeholder.json', 'placeholder.json');
    const scrollHandleImage = await FileUploader.getAssetAsFile('assets/sliders/ScrollHandle.webp', 'ScrollHandle.webp');
    const scrollHandleJson = await FileUploader.getAssetAsFile('assets/sliders/ScrollHandle.json', 'ScrollHandle.json');
    await FileUploader.processFileUpload([placeholderImage, placeholderJson, scrollHandleImage, scrollHandleJson]);
}
//# sourceMappingURL=initDefaultImages.js.map