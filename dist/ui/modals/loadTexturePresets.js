import { config } from "../../CONFIG.js";
import { loadPresetTextureSets } from "../../files/initDefaultImages.js";
import { presetManager } from "../../presetManager.js";
import { authManager } from "../../auth.js";
import { Notification } from "../../ui/notifs/noficationMaker.js";
const modal = document.getElementById("modalLoadTexturePresets");
const closeBtn = document.getElementById("modalLoadTexturePresetsClose");
const form = document.getElementsByClassName("modalLoadTexturePresetsForm")[0];
const options = [
    {
        name: "turquoise_ore-ui_style",
        displayName: "Turquoise Ore-UI Style",
    },
    {
        name: "red_ore-ui_style",
        displayName: "Red Ore-UI Style",
    },
    {
        name: "pink_ore-ui_style",
        displayName: "Pink Ore-UI Style",
    },
    {
        name: "eternal_ore-ui_style",
        displayName: "Eternal Ore-UI Style",
    },
    {
        name: "other_ore-ui_style",
        displayName: "Other Ore-UI Style",
    },
];
export async function loadTexturePresetsModal() {
    modal.style.display = "block";
    // Clears the form
    form.innerHTML = "";
    const bodyText = document.createElement("p");
    bodyText.innerHTML = "To get the textures in MC<br>download the files from github";
    bodyText.className = "modalOptionInput";
    bodyText.style.textAlign = "center";
    form.appendChild(bodyText);
    form.appendChild(document.createElement("br"));
    // Add user presets section
    const user = authManager.getCurrentUser();
    if (user) {
        await addUserPresetsSection(form, user.id);
    }
    else {
        // Show message to sign in for user presets
        const signInMessage = document.createElement("p");
        signInMessage.innerHTML = '<em>Sign in to upload and view your presets</em>';
        signInMessage.style.color = "#ccc";
        signInMessage.style.textAlign = "center";
        signInMessage.style.marginTop = "10px";
        form.appendChild(signInMessage);
    }
    const elements = [];
    // Adds the options
    for (let option of options) {
        const input = document.createElement("input");
        input.type = "checkbox";
        input.name = option.name;
        input.style.maxWidth = "100px";
        input.className = "modalOptionInput";
        console.log(config.texturePresets);
        input.checked = config.texturePresets[option.name];
        if (input.checked === true) {
            input.disabled = true;
        }
        const label = document.createElement("label");
        label.textContent = `${option.displayName}: `;
        label.className = "modalOptionLabel";
        // Add the nodes
        form.appendChild(label);
        form.appendChild(input);
        form.appendChild(document.createElement("br"));
        elements.push(input);
    }
    // Make submit button
    const submit = document.createElement("input");
    submit.type = "submit";
    submit.value = "Load Textures";
    submit.className = "modalSubmitButton";
    // Add submit button
    form.appendChild(submit);
    new Promise(() => {
        submit.onclick = async () => {
            // Handle built-in presets
            for (let i = 0; i < elements.length; i++) {
                const element = elements[i];
                const checked = element.checked;
                console.log("value", checked);
                if (!checked)
                    continue;
                if (config.texturePresets[element.name] == true)
                    continue;
                loadPresetTextureSets(element.name);
                config.texturePresets[element.name] = true;
            }
            // Handle user presets
            const presetCheckboxes = form.querySelectorAll('input[type="checkbox"][data-preset-id]');
            console.log('Found preset checkboxes:', presetCheckboxes.length);
            for (let checkbox of Array.from(presetCheckboxes)) {
                if (checkbox.checked) {
                    const presetId = parseInt(checkbox.dataset.presetId);
                    const presetType = checkbox.dataset.presetType;
                    console.log('Loading preset:', presetId, presetType);
                    // Load user preset data and add to images
                    if (presetType === 'user' || presetType === 'public') {
                        // Get the full preset data from database first
                        const userPresets = await window.presetManager.getUserPresets();
                        const preset = userPresets.find((p) => p.id === presetId);
                        if (!preset) {
                            console.log('Preset not found in database for ID:', presetId);
                            continue;
                        }
                        // Load preset containing multiple files
                        console.log('Loading preset with multiple files:', preset.name);
                        try {
                            // Get metadata about all files in this preset
                            const metadataStr = localStorage.getItem(preset.png_path); // metadata key stored as png_path
                            if (!metadataStr) {
                                console.error('No metadata found for preset:', preset.name);
                                continue;
                            }
                            const files = JSON.parse(metadataStr);
                            console.log('Preset contains', files.length, 'files:', files.map(f => f.name));
                            // Load each file individually
                            const loadedImages = {};
                            for (const file of files) {
                                try {
                                    if (file.type === 'png') {
                                        const pngData = localStorage.getItem(file.key);
                                        if (pngData) {
                                            const imageData = await createImageDataFromBase64(pngData);
                                            const imageName = file.name.replace('.png', ''); // Use original filename without extension
                                            if (!loadedImages[imageName]) {
                                                loadedImages[imageName] = {};
                                            }
                                            loadedImages[imageName].png = imageData;
                                            console.log('Loaded PNG from preset:', imageName);
                                        }
                                    }
                                    else if (file.type === 'json') {
                                        const jsonDataStr = localStorage.getItem(file.key);
                                        if (jsonDataStr) {
                                            const jsonData = JSON.parse(jsonDataStr);
                                            const imageName = file.name.replace('.json', ''); // Use original filename without extension
                                            if (!loadedImages[imageName]) {
                                                loadedImages[imageName] = {};
                                            }
                                            loadedImages[imageName].json = jsonData;
                                            console.log('Loaded JSON from preset:', imageName);
                                        }
                                    }
                                }
                                catch (error) {
                                    console.error('Error loading file from preset:', file.name, error);
                                }
                            }
                            // Now add all loaded images to the images map with proper NineSlice data
                            for (const [imageName, data] of Object.entries(loadedImages)) {
                                if (window.images) {
                                    window.images.set(imageName, data);
                                    console.log(`Added ${imageName} to images map with PNG: ${!!data.png}, JSON: ${!!data.json}`);
                                }
                            }
                            // Also save to assets folder structure for persistence
                            for (const [imageName, data] of Object.entries(loadedImages)) {
                                await saveLoadedTextureToAssets(imageName, data);
                            }
                            new Notification(`Loaded ${files.length} files from preset: ${preset.name}`, 3000, 'notif');
                            console.log('Successfully loaded all files from preset:', preset.name);
                        }
                        catch (error) {
                            console.error('Error loading preset:', preset.name, error);
                        }
                    }
                }
            }
            modal.style.display = "none";
        };
    });
    // Helper function to create ImageData from base64
    async function createImageDataFromBase64(base64Data) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                const imageData = ctx.getImageData(0, 0, img.width, img.height);
                resolve(imageData);
            };
            img.onerror = reject;
            // Ensure the data has proper data URL format
            let imageSrc = base64Data;
            if (!base64Data.startsWith('data:image/')) {
                imageSrc = `data:image/png;base64,${base64Data}`;
            }
            img.src = imageSrc;
        });
    }
    /**
     * Saves loaded texture to localStorage for persistence
     */
    async function saveLoadedTextureToAssets(imageName, data) {
        try {
            if (data.png) {
                // Convert ImageData to base64 for storage
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = data.png.width;
                canvas.height = data.png.height;
                ctx.putImageData(data.png, 0, 0);
                const base64 = canvas.toDataURL('image/png');
                localStorage.setItem(`asset_${imageName}_png`, JSON.stringify({
                    base64: base64,
                    metadata: {
                        name: `${imageName}.png`,
                        type: 'png',
                        relativePath: `assets/${imageName}.png`,
                        presetLoaded: true,
                        loadedAt: new Date().toISOString()
                    }
                }));
            }
            if (data.json) {
                localStorage.setItem(`asset_${imageName}_json`, JSON.stringify({
                    jsonContent: data.json,
                    metadata: {
                        name: `${imageName}.json`,
                        type: 'json',
                        relativePath: `assets/${imageName}.json`,
                        presetLoaded: true,
                        loadedAt: new Date().toISOString()
                    }
                }));
            }
            console.log(`Saved ${imageName} to assets folder structure`);
        }
        catch (error) {
            console.error('Error saving texture to assets:', error);
        }
    }
}
/**
 * Hides the add button modal
 */
closeBtn.onclick = () => {
    modal.style.display = "none";
    form.innerHTML = "";
};
export async function addUserPresetsSection(form, userId) {
    console.log('=== LOADING USER PRESETS SECTION ===');
    // Add section header
    const header = document.createElement("h3");
    header.textContent = "Your Uploaded Presets";
    header.style.color = "white";
    header.style.marginTop = "20px";
    header.style.marginBottom = "10px";
    form.appendChild(header);
    try {
        // Get user presets
        console.log('Getting user presets for user ID:', userId);
        const userPresets = await presetManager.getUserPresets();
        console.log('Retrieved user presets:', userPresets.length, userPresets);
        const publicPresets = await presetManager.getPublicPresets();
        console.log('Retrieved public presets:', publicPresets.length, publicPresets);
        // Filter to only user's own presets
        const userOwnPresets = userPresets.filter(p => p.user_id === userId);
        console.log('Filtered user own presets:', userOwnPresets.length, userOwnPresets);
        if (userOwnPresets.length === 0 && publicPresets.length === 0) {
            console.log('No presets found for user');
            const noPresets = document.createElement("p");
            noPresets.textContent = "No presets available. Upload some presets first!";
            noPresets.style.color = "#ccc";
            noPresets.style.textAlign = "center";
            form.appendChild(noPresets);
            return;
        }
        console.log('Adding', userOwnPresets.length, 'user presets and', publicPresets.length, 'public presets to form');
        // Add user presets
        if (userOwnPresets.length > 0) {
            console.log('Adding user presets section...');
            const userSection = document.createElement("div");
            userSection.style.marginBottom = "15px";
            const userTitle = document.createElement("h4");
            userTitle.textContent = "Your Presets";
            userTitle.style.color = "white";
            userTitle.style.marginBottom = "8px";
            userSection.appendChild(userTitle);
            for (const preset of userOwnPresets) {
                console.log('Adding preset to UI:', preset);
                const presetDiv = document.createElement("div");
                presetDiv.style.display = "flex";
                presetDiv.style.alignItems = "center";
                presetDiv.style.marginBottom = "5px";
                presetDiv.style.padding = "5px";
                presetDiv.style.backgroundColor = "rgba(255,255,255,0.05)";
                presetDiv.style.borderRadius = "4px";
                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.name = `user_preset_${preset.id}`;
                checkbox.dataset.presetId = preset.id.toString();
                checkbox.dataset.presetType = 'user';
                checkbox.style.marginRight = "10px";
                presetDiv.appendChild(checkbox);
                const label = document.createElement("label");
                label.textContent = preset.name;
                label.style.color = "white";
                label.style.flex = "1";
                presetDiv.appendChild(label);
                const visibility = document.createElement("span");
                visibility.textContent = preset.is_public ? "(Public)" : "(Private)";
                visibility.style.color = preset.is_public ? "#28a745" : "#ffc107";
                visibility.style.fontSize = "12px";
                presetDiv.appendChild(visibility);
                userSection.appendChild(presetDiv);
            }
            form.appendChild(userSection);
        }
        // Add public presets
        if (publicPresets.length > 0) {
            console.log('Adding public presets section...');
            const publicSection = document.createElement("div");
            publicSection.style.marginBottom = "15px";
            const publicTitle = document.createElement("h4");
            publicTitle.textContent = "Public Presets";
            publicTitle.style.color = "white";
            publicTitle.style.marginBottom = "8px";
            publicSection.appendChild(publicTitle);
            for (const preset of publicPresets) {
                console.log('Adding public preset to UI:', preset);
                const presetDiv = document.createElement("div");
                presetDiv.style.display = "flex";
                presetDiv.style.alignItems = "center";
                presetDiv.style.marginBottom = "5px";
                presetDiv.style.padding = "5px";
                presetDiv.style.backgroundColor = "rgba(0,123,255,0.1)";
                presetDiv.style.borderRadius = "4px";
                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.name = `public_preset_${preset.id}`;
                checkbox.dataset.presetId = preset.id.toString();
                checkbox.dataset.presetType = 'public';
                checkbox.style.marginRight = "10px";
                presetDiv.appendChild(checkbox);
                const label = document.createElement("label");
                label.textContent = preset.name;
                label.style.color = "white";
                label.style.flex = "1";
                presetDiv.appendChild(label);
                const publicBadge = document.createElement("span");
                publicBadge.textContent = "(Public)";
                publicBadge.style.color = "#28a745";
                publicBadge.style.fontSize = "12px";
                presetDiv.appendChild(publicBadge);
                publicSection.appendChild(presetDiv);
            }
            form.appendChild(publicSection);
        }
        console.log('=== USER PRESETS SECTION LOADED ===');
    }
    catch (error) {
        console.error("❌ Error loading user presets:", error);
        const errorMsg = document.createElement("p");
        errorMsg.textContent = "Error loading presets";
        errorMsg.style.color = "#dc3545";
        form.appendChild(errorMsg);
    }
}
window.addEventListener("click", (event) => {
    if (event.target == modal) {
        modal.style.display = "none";
        form.innerHTML = "";
    }
});
//# sourceMappingURL=loadTexturePresets.js.map