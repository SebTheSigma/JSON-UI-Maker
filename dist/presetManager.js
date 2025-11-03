// Preset management for user-uploaded presets
import { authManager } from './auth.js';
class PresetManager {
    STORAGE_PREFIX = 'json_ui_preset_';
    async uploadPreset(files, presetName, isPublic = false) {
        const user = authManager.getCurrentUser();
        if (!user) {
            return { success: false, message: 'You must be signed in to upload presets' };
        }
        console.log('=== STARTING PRESET UPLOAD ===');
        console.log('User:', user.username, 'ID:', user.id);
        console.log('Preset name:', presetName);
        console.log('Is public:', isPublic);
        console.log('Files count:', files.length);
        // Check existing presets BEFORE upload
        console.log('🔍 Checking existing presets before upload...');
        const existingPresets = await this.getUserPresets();
        console.log('Existing presets before upload (names):', existingPresets.map((p) => p.name));
        console.log('Existing presets before upload (full):', existingPresets);
        // Also check what's in localStorage
        const allLocalKeys = Object.keys(localStorage).filter(key => key.includes('preset'));
        console.log('🔍 LocalStorage preset keys before upload:', allLocalKeys.length, allLocalKeys);
        // Check database directly
        if (window.dbManager) {
            const directDbPresets = await window.dbManager.getUserPresets(user.id);
            console.log('🔍 Direct database query before upload:', directDbPresets.length, directDbPresets.map((p) => p.name));
        }
        // Validate files - collect all PNG and JSON files
        const pngFiles = [];
        const jsonFiles = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (!file)
                continue;
            console.log(`File ${i}:`, file.name, file.type, file.size);
            if (file.name.toLowerCase().endsWith('.png')) {
                pngFiles.push(file);
            }
            else if (file.name.toLowerCase().endsWith('.json') && !file.name.toLowerCase().includes('mapping')) {
                jsonFiles.push(file);
            }
        }
        console.log('Filtered files - PNG:', pngFiles.length, 'JSON:', jsonFiles.length);
        if (pngFiles.length === 0 && jsonFiles.length === 0) {
            return { success: false, message: 'Preset must include at least one PNG or nineslice JSON file (mappings.json excluded)' };
        }
        // Create ONE preset containing ALL uploaded files
        try {
            const storedFiles = [];
            // Store all PNG files
            for (const pngFile of pngFiles) {
                const pngKey = this.STORAGE_PREFIX + 'png_' + Date.now() + '_' + Math.random() + '_' + pngFile.name;
                const pngData = await this.fileToBase64(pngFile);
                localStorage.setItem(pngKey, pngData);
                storedFiles.push({ name: pngFile.name, type: 'png', key: pngKey });
                console.log(`Stored PNG: ${pngFile.name} -> ${pngKey}`);
            }
            // Store all JSON files
            for (const jsonFile of jsonFiles) {
                // Validate JSON is valid nineslice format
                const jsonContent = await jsonFile.text();
                const jsonData = JSON.parse(jsonContent);
                if (!this.isValidNinesliceJson(jsonData)) {
                    console.log(`Skipping invalid JSON file: ${jsonFile.name}`);
                    continue; // Skip invalid JSON files
                }
                const jsonKey = this.STORAGE_PREFIX + 'json_' + Date.now() + '_' + Math.random() + '_' + jsonFile.name;
                localStorage.setItem(jsonKey, jsonContent);
                storedFiles.push({ name: jsonFile.name, type: 'json', key: jsonKey });
                console.log(`Stored JSON: ${jsonFile.name} -> ${jsonKey}`);
            }
            // Store file metadata
            const metadataKey = this.STORAGE_PREFIX + 'metadata_' + Date.now() + '_' + Math.random();
            localStorage.setItem(metadataKey, JSON.stringify(storedFiles));
            console.log('Stored metadata:', metadataKey, storedFiles.length, 'files');
            // Create single preset record with metadata reference
            console.log('Creating preset in database...');
            const preset = await window.dbManager.createPreset(user.id, presetName, metadataKey, // Store metadata key as png_path
            '', // No single json_path since we have multiple files
            isPublic // Use the provided visibility setting
            );
            console.log('✅ Preset created successfully:', preset);
            // Check presets AFTER upload
            console.log('🔍 Checking presets after upload...');
            const presetsAfterUpload = await this.getUserPresets();
            console.log('Presets after upload:', presetsAfterUpload.length, presetsAfterUpload);
            // Immediately load the uploaded textures into the system
            await this.loadPresetTexturesIntoSystem(storedFiles);
            console.log(`=== PRESET UPLOAD COMPLETE ===`);
            console.log(`Created preset "${presetName}" with ${storedFiles.length} files`);
            return {
                success: true,
                message: `Successfully uploaded preset "${presetName}" with ${storedFiles.length} file(s)`
            };
        }
        catch (error) {
            console.error('❌ Error creating preset:', error);
            return { success: false, message: 'Failed to create preset' };
        }
    }
    async getUserPresets() {
        const user = authManager.getCurrentUser();
        console.log('🔍 Getting user presets for user:', user?.username, 'ID:', user?.id);
        if (!user) {
            console.log('❌ No user found, returning empty array');
            return [];
        }
        try {
            // Force database save before query to ensure latest data
            if (window.dbManager && typeof window.dbManager.save === 'function') {
                await window.dbManager.save();
            }
            const presets = await window.dbManager.getUserPresets(user.id);
            console.log('✅ Retrieved', presets.length, 'presets from database:', presets.map((p) => p.name));
            return presets;
        }
        catch (error) {
            console.error('❌ Error getting user presets:', error);
            return [];
        }
    }
    async getPublicPresets() {
        try {
            return await window.dbManager.getPublicPresets();
        }
        catch (error) {
            console.error('Error getting public presets:', error);
            return [];
        }
    }
    async makePresetPublic(presetId) {
        const user = authManager.getCurrentUser();
        if (!user) {
            return { success: false, message: 'You must be signed in' };
        }
        try {
            // Get existing preset
            const presets = await this.getUserPresets();
            const preset = presets.find(p => p.id === presetId);
            if (!preset || preset.user_id !== user.id) {
                return { success: false, message: 'Preset not found or access denied' };
            }
            // Try to update via database manager first
            if (window.dbManager && typeof window.dbManager.updatePreset === 'function') {
                await window.dbManager.updatePreset(presetId, { is_public: !preset.is_public });
            }
            else {
                // Fallback: delete old and create new with updated visibility
                if (window.dbManager && typeof window.dbManager.deletePreset === 'function') {
                    await window.dbManager.deletePreset(presetId);
                }
                await window.dbManager.createPreset(user.id, preset.name, preset.png_path, preset.json_path, !preset.is_public);
            }
            const newVisibility = !preset.is_public;
            return {
                success: true,
                message: `Preset made ${newVisibility ? 'public' : 'private'}`
            };
        }
        catch (error) {
            console.error('Error updating preset visibility:', error);
            return { success: false, message: 'Failed to update preset visibility' };
        }
    }
    getPresetData(preset) {
        try {
            console.log('Getting preset data for:', preset);
            console.log('Looking for PNG key:', preset.png_path);
            console.log('Looking for JSON key:', preset.json_path);
            const pngData = localStorage.getItem(preset.png_path);
            const jsonDataStr = localStorage.getItem(preset.json_path);
            console.log('PNG data found:', !!pngData, 'JSON data found:', !!jsonDataStr);
            console.log('PNG data length:', pngData ? pngData.length : 0, 'JSON data length:', jsonDataStr ? jsonDataStr.length : 0);
            if (!pngData || !jsonDataStr) {
                console.log('Missing data - PNG:', !!pngData, 'JSON:', !!jsonDataStr);
                // List all localStorage keys containing 'preset' for debugging
                const presetKeys = Object.keys(localStorage).filter(key => key.includes('preset'));
                console.log('All preset keys in localStorage:', presetKeys);
                return null;
            }
            const jsonData = JSON.parse(jsonDataStr);
            console.log('Successfully parsed preset data');
            return { pngData, jsonData };
        }
        catch (error) {
            console.error('Error getting preset data:', error);
            return null;
        }
    }
    isValidNinesliceJson(data) {
        // Basic validation for nineslice JSON
        return data && typeof data === 'object' &&
            (data.nineslice_size !== undefined || data.uv !== undefined);
    }
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
    /**
     * Loads preset textures directly into the system after upload
     */
    async loadPresetTexturesIntoSystem(storedFiles) {
        try {
            const loadedImages = {};
            for (const file of storedFiles) {
                try {
                    if (file.type === 'png') {
                        const pngData = localStorage.getItem(file.key);
                        if (pngData) {
                            const imageData = await this.createImageDataFromBase64(pngData);
                            const imageName = file.name.replace('.png', '');
                            if (!loadedImages[imageName]) {
                                loadedImages[imageName] = {};
                            }
                            loadedImages[imageName].png = imageData;
                            console.log('Loaded PNG from upload:', imageName);
                        }
                    }
                    else if (file.type === 'json') {
                        const jsonDataStr = localStorage.getItem(file.key);
                        if (jsonDataStr) {
                            const jsonData = JSON.parse(jsonDataStr);
                            const imageName = file.name.replace('.json', '');
                            if (!loadedImages[imageName]) {
                                loadedImages[imageName] = {};
                            }
                            loadedImages[imageName].json = jsonData;
                            console.log('Loaded JSON from upload:', imageName);
                        }
                    }
                }
                catch (error) {
                    console.error('Error loading file from upload:', file.name, error);
                }
            }
            // Add all loaded images to the images map
            for (const [imageName, data] of Object.entries(loadedImages)) {
                if (window.images) {
                    window.images.set(imageName, data);
                    console.log(`Added ${imageName} to images map from upload with PNG: ${!!data.png}, JSON: ${!!data.json}`);
                }
            }
            console.log(`Successfully loaded ${Object.keys(loadedImages).length} textures from upload`);
        }
        catch (error) {
            console.error('Error loading preset textures into system:', error);
        }
    }
    /**
     * Helper function to create ImageData from base64
     */
    async createImageDataFromBase64(base64Data) {
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
}
// Global instance
export const presetManager = new PresetManager();
//# sourceMappingURL=presetManager.js.map