import { FileUploader } from "./openFiles.js";



export async function initDefaultImages() {
    const placeholderImage = await FileUploader.getAssetAsFile('assets/placeholder.webp', 'placeholder.webp');
    (placeholderImage as any)._webkitRelativePath = 'assets/placeholder.webp';

    const placeholderJson = await FileUploader.getAssetAsFile('assets/placeholder.json', 'placeholder.json');
    (placeholderJson as any)._webkitRelativePath = 'assets/placeholder.json';

    const scrollHandleImage = await FileUploader.getAssetAsFile('assets/sliders/ScrollHandle.webp', 'ScrollHandle.webp');
    (scrollHandleImage as any)._webkitRelativePath = 'assets/sliders/ScrollHandle.webp';

    const scrollHandleJson = await FileUploader.getAssetAsFile('assets/sliders/ScrollHandle.json', 'ScrollHandle.json');
    (scrollHandleJson as any)._webkitRelativePath = 'assets/sliders/ScrollHandle.json';

    await FileUploader.processFileUpload([placeholderImage, placeholderJson, scrollHandleImage, scrollHandleJson]);
}

export async function loadPresetTextureSets(textureSet: string) {
    const mapFile = await FileUploader.getAssetAsFile(`presets/textures/${textureSet}/mapping.json`, `mapping.json`);
    (mapFile as any)._webkitRelativePath = `presets/textures/${textureSet}/mapping.json`;

    const mapJson = await FileUploader.readJsonFile(mapFile);


    for (let imageInfo of mapJson.data) {
        const image = imageInfo.image;
        const isNineslice = imageInfo.nineslice;

        const imageFile = await FileUploader.getAssetAsFile(`presets/textures/${textureSet}/${image}.png`, `${image}.png`);
        (imageFile as any)._webkitRelativePath = `ui/presets/${textureSet}/${image}.png`;

        if (isNineslice) {
            const imageJson = await FileUploader.getAssetAsFile(`presets/textures/${textureSet}/${image}.json`, `${image}.json`);
            (imageJson as any)._webkitRelativePath = `ui/presets/${textureSet}/${image}.json`;

            await FileUploader.processFileUpload([imageFile, imageJson]);

        }

        else {
            await FileUploader.processFileUpload([imageFile]);
        }
    }
}