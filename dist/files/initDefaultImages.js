import { FileUploader } from "./openFiles.js";
export async function initDefaultImages() {
    const placeholderImage = await FileUploader.getAssetAsFile('assets/placeholder.webp', 'placeholder.webp');
    placeholderImage._webkitRelativePath = 'assets/placeholder.webp';
    const placeholderJson = await FileUploader.getAssetAsFile('assets/placeholder.json', 'placeholder.json');
    placeholderJson._webkitRelativePath = 'assets/placeholder.json';
    const scrollHandleImage = await FileUploader.getAssetAsFile('assets/sliders/ScrollHandle.webp', 'ScrollHandle.webp');
    scrollHandleImage._webkitRelativePath = 'assets/sliders/ScrollHandle.webp';
    const scrollHandleJson = await FileUploader.getAssetAsFile('assets/sliders/ScrollHandle.json', 'ScrollHandle.json');
    scrollHandleJson._webkitRelativePath = 'assets/sliders/ScrollHandle.json';
    await FileUploader.processFileUpload([placeholderImage, placeholderJson, scrollHandleImage, scrollHandleJson]);
}
export async function loadPresetTextureSets(textureSet) {
    const mapFile = await FileUploader.getAssetAsFile(`presets/textures/${textureSet}/mapping.json`, `mapping.json`);
    mapFile._webkitRelativePath = `presets/textures/${textureSet}/mapping.json`;
    const mapJson = await FileUploader.readJsonFile(mapFile);
    console.log('mapJson', mapJson);
    for (let imageInfo of mapJson.data) {
        console.log('imageInfo', imageInfo);
        const image = imageInfo.image;
        const isNineslice = imageInfo.nineslice;
        const imageFile = await FileUploader.getAssetAsFile(`presets/textures/${textureSet}/${image}.png`, `${image}.png`);
        imageFile._webkitRelativePath = `ui/presets/${textureSet}/${image}.png`;
        if (isNineslice) {
            const imageJson = await FileUploader.getAssetAsFile(`presets/textures/${textureSet}/${image}.json`, `${image}.json`);
            imageJson._webkitRelativePath = `ui/presets/${textureSet}/${image}.json`;
            await FileUploader.processFileUpload([imageFile, imageJson]);
        }
        else {
            await FileUploader.processFileUpload([imageFile]);
        }
    }
}
//# sourceMappingURL=initDefaultImages.js.map