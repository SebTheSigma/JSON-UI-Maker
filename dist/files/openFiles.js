import { images, updateImageDropdown } from "../index.js";
export function handlePackUpload() {
    const fileInput = document.getElementById("pack_importer");
    if (!fileInput?.files)
        return;
    const files = Array.from(fileInput.files);
    // Debug: list all files
    files.forEach(file => console.log(file.name));
    // Process only .png images
    const pngFiles = files.filter(file => file.name.endsWith(".png"));
    for (const pngFile of pngFiles) {
        const baseName = pngFile.name.replace(/\.[^.]*$/, "");
        // Try to find matching JSON file
        const jsonFile = files.find(file => file.name === `${baseName}.json`);
        if (jsonFile) {
            const jsonReader = new FileReader();
            jsonReader.onload = () => {
                try {
                    const json = JSON.parse(jsonReader.result);
                    const existingData = images.get(baseName) ?? {};
                    existingData.json = json;
                    images.set(baseName, existingData);
                    updateImageDropdown();
                    console.log(`Loaded JSON for ${baseName}:`, json);
                }
                catch (err) {
                    console.error(`Error parsing JSON for ${baseName}:`, err);
                }
            };
            jsonReader.readAsText(jsonFile);
        }
        const imgReader = new FileReader();
        imgReader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const existingData = images.get(baseName) ?? {};
                existingData.png = imageData;
                images.set(baseName, existingData);
                updateImageDropdown();
                console.log(`Loaded image for ${baseName}:`, existingData);
            };
            img.src = e.target.result;
        };
        imgReader.readAsDataURL(pngFile);
    }
}
//# sourceMappingURL=openFiles.js.map