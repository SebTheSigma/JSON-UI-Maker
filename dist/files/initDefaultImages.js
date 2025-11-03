import { FileUploader } from "./openFiles.js";
export async function initDefaultImages() {
    const placeholderImage = await FileUploader.getAssetAsFile("assets/placeholder.webp", "placeholder.webp");
    placeholderImage._webkitRelativePath = "assets/placeholder.webp";
    const placeholderJson = await FileUploader.getAssetAsFile("assets/placeholder.json", "placeholder.json");
    placeholderJson._webkitRelativePath = "assets/placeholder.json";
    const scrollHandleImage = await FileUploader.getAssetAsFile("assets/sliders/ScrollHandle.webp", "ScrollHandle.webp");
    scrollHandleImage._webkitRelativePath = "assets/sliders/ScrollHandle.webp";
    const scrollHandleJson = await FileUploader.getAssetAsFile("assets/sliders/ScrollHandle.json", "ScrollHandle.json");
    scrollHandleJson._webkitRelativePath = "assets/sliders/ScrollHandle.json";
    await FileUploader.processFileUpload([placeholderImage, placeholderJson, scrollHandleImage, scrollHandleJson]);
}
export async function loadPresetTextureSets(textureSet) {
    const mapFile = await FileUploader.getAssetAsFile(`presets/textures/${textureSet}/mapping.json`, `mapping.json`);
    mapFile._webkitRelativePath = `presets/textures/${textureSet}/mapping.json`;
    const mapJson = await FileUploader.readJsonFile(mapFile);
    console.log("mapJson", mapJson);
    for (let imageInfo of mapJson.data) {
        console.log("imageInfo", imageInfo);
        const image = imageInfo.image;
        const isNineslice = imageInfo.nineslice;
        const imageFile = await FileUploader.getAssetAsFile(`presets/textures/${textureSet}/${image}.png`, `${image}.png`);
        // Properly set relative path for saving to assets folder
        imageFile._webkitRelativePath = `assets/${image}.png`;
        if (isNineslice) {
            const imageJson = await FileUploader.getAssetAsFile(`presets/textures/${textureSet}/${image}.json`, `${image}.json`);
            imageJson._webkitRelativePath = `assets/${image}.json`;
            await FileUploader.processFileUpload([imageFile, imageJson]);
            // Also save the files to the actual assets folder structure
            await saveTextureToAssetsFolder(imageFile, imageJson);
        }
        else {
            await FileUploader.processFileUpload([imageFile]);
            // Also save the file to the actual assets folder structure
            await saveTextureToAssetsFolder(imageFile);
        }
    }
}
/**
 * Saves texture files to the project's assets folder structure
 * This ensures the textures are available for the project and maintain proper file paths
 */
async function saveTextureToAssetsFolder(imageFile, jsonFile) {
    try {
        // For now, we'll store the file references in the browser's storage for demo purposes
        // In a real implementation, this would save to the actual file system
        const imageName = imageFile.name.replace('.png', '');
        // Store file metadata for later access
        const fileMetadata = {
            name: imageFile.name,
            type: 'png',
            relativePath: `assets/${imageFile.name}`,
            presetLoaded: true,
            loadedAt: new Date().toISOString()
        };
        // Store PNG file as base64 for persistence
        const pngBase64 = await fileToBase64(imageFile);
        localStorage.setItem(`asset_${imageName}_png`, JSON.stringify({
            base64: pngBase64,
            metadata: fileMetadata
        }));
        // Store JSON file if provided (nineslice data)
        if (jsonFile) {
            const jsonContent = await jsonFile.text();
            const jsonBase64 = await fileToBase64(jsonFile);
            localStorage.setItem(`asset_${imageName}_json`, JSON.stringify({
                base64: jsonBase64,
                jsonContent: JSON.parse(jsonContent),
                metadata: {
                    name: jsonFile.name,
                    type: 'json',
                    relativePath: `assets/${jsonFile.name}`,
                    presetLoaded: true,
                    loadedAt: new Date().toISOString()
                }
            }));
        }
        console.log(`Saved texture ${imageName} to assets folder structure`);
    }
    catch (error) {
        console.error('Error saving texture to assets folder:', error);
    }
}
/**
 * Helper function to convert File to base64
 */
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
//# sourceMappingURL=initDefaultImages.js.map