// Modal for uploading user presets
export class UploadPresetModal {
    modal = null;
    init() {
        this.createModal();
        this.setupEventListeners();
    }
    show() {
        this.modal.style.display = 'block';
    }
    hide() {
        this.modal.style.display = 'none';
    }
    createModal() {
        const modalHtml = `
      <div id="modalUploadPreset" class="modal">
        <div class="modal-content" style="max-width: 500px;">
          <span id="modalUploadPresetClose" class="modalClose" style="cursor: pointer;">&times;</span>
          <h2 class="modalHeader">Upload Preset</h2>
          <div class="modalUploadPresetForm">
            <p style="color: white; margin-bottom: 15px;">
              Upload PNG textures and their corresponding nineslice JSON files.
              <strong>Note:</strong> mappings.json files are not allowed.
            </p>

            <form id="uploadPresetForm">
              <div class="upload-form-group">
                <label for="presetName" class="upload-label">
                  Preset Name:
                </label>
                <input type="text" id="presetName" name="presetName"
                       placeholder="Enter a name for your preset"
                       style="display: block; width: 100%; padding: 8px; margin-bottom: 15px; border: 1px solid #ccc; border-radius: 4px; background-color: rgba(255,255,255,0.05); color: white;" required>
              </div>

              <div class="upload-form-group">
                <label for="presetFiles" class="upload-label">
                  Select PNG and JSON files:
                </label>
                <input type="file" id="presetFiles" name="presetFiles"
                       accept=".png,.json" multiple required style="display: block;">
                <div class="file-info" style="color: #ccc; font-size: 12px; margin-top: 5px;">
                  You can select multiple PNG files and their corresponding JSON files
                </div>
              </div>

              <div class="upload-form-group">
                <label class="upload-label">
                  <input type="checkbox" id="presetIsPublic" name="presetIsPublic" style="margin-right: 8px;">
                  Make this preset public
                </label>
                <div class="file-info" style="color: #ccc; font-size: 12px; margin-top: 5px;">
                  Public presets can be seen and used by other users
                </div>
              </div>

              <div class="upload-form-buttons">
                <button type="submit" id="uploadPresetBtn">Upload Preset</button>
              </div>
            </form>

            <div id="uploadMessage" class="upload-message" style="display: none;"></div>
          </div>
        </div>
      </div>
    `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        this.modal = document.getElementById('modalUploadPreset');
        // Add CSS styles
        const style = document.createElement('style');
        style.textContent = `
      .upload-form-group {
        margin-bottom: 20px;
      }

      .upload-label {
        display: block;
        margin-bottom: 8px;
        color: white;
        font-weight: 500;
      }

      .upload-form-group input[type="file"] {
        width: 100%;
        padding: 8px;
        border: 2px dashed #ccc;
        border-radius: 4px;
        background-color: rgba(255, 255, 255, 0.05);
        color: white;
        cursor: pointer;
      }

      .upload-form-group input[type="file"]:hover {
        border-color: #007bff;
        background-color: rgba(0, 123, 255, 0.1);
      }

      .upload-form-buttons {
        display: flex;
        justify-content: center;
        margin-top: 20px;
      }

      .upload-form-buttons button {
        padding: 12px 24px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        background-color: #007bff;
        color: white;
      }

      .upload-form-buttons button:hover {
        background-color: #0056b3;
      }

      .upload-form-buttons button:disabled {
        background-color: #6c757d;
        cursor: not-allowed;
      }

      .upload-message {
        margin-top: 15px;
        padding: 10px;
        border-radius: 4px;
        text-align: center;
        font-weight: 500;
      }

      .upload-message.success {
        background-color: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
      }

      .upload-message.error {
        background-color: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
      }
    `;
        document.head.appendChild(style);
    }
    setupEventListeners() {
        const closeBtn = document.getElementById('modalUploadPresetClose');
        const form = document.getElementById('uploadPresetForm');
        closeBtn?.addEventListener('click', () => this.hide());
        form?.addEventListener('submit', (e) => this.handleSubmit(e));
        // Close modal when clicking outside
        this.modal?.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hide();
            }
        });
    }
    async handleSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const files = document.getElementById('presetFiles').files;
        const presetName = document.getElementById('presetName').value.trim();
        const presetIsPublic = document.getElementById('presetIsPublic').checked;
        if (!presetName) {
            this.showMessage('Please enter a name for your preset', 'error');
            return;
        }
        if (!files || files.length === 0) {
            this.showMessage('Please select files to upload', 'error');
            return;
        }
        const submitBtn = document.getElementById('uploadPresetBtn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Uploading...';
        try {
            console.log('Starting preset upload with files:', files.length);
            const presetManager = window.presetManager;
            const result = await presetManager.uploadPreset(files, presetName, presetIsPublic);
            console.log('Upload result:', result);
            if (result.success) {
                this.showMessage(result.message, 'success');
                setTimeout(() => {
                    this.hide();
                    // Clear the form
                    e.target.reset();
                    console.log('🔄 Refreshing preset system after successful upload...');
                    // Refresh preset management modal if it's open
                    if (window.presetManagementModal) {
                        console.log('🔄 Refreshing preset management modal...');
                        window.presetManagementModal.refreshPresets();
                    }
                    // Trigger UI update and add textures to the system
                    if (window.Builder) {
                        console.log('🔄 Refreshing texture system...');
                        window.Builder.refreshPresetTextures();
                    }
                    // Force reload all presets to ensure they're visible
                    this.forcePresetReload();
                }, 1500);
            }
            else {
                this.showMessage(result.message, 'error');
            }
        }
        catch (error) {
            console.error('Upload error:', error);
            this.showMessage('An unexpected error occurred during upload', 'error');
        }
        finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Upload Preset';
        }
    }
    async forcePresetReload() {
        try {
            console.log('🔄 Forcing preset reload...');
            // Force reload presets from database
            if (window.presetManager) {
                console.log('🔄 Reloading presets from preset manager...');
                const presets = await window.presetManager.getUserPresets();
                console.log('🔄 Reloaded presets:', presets.length, presets);
            }
            // Also reload the load texture presets modal if open
            const loadModal = document.getElementById('modalLoadTexturePresets');
            if (loadModal && loadModal.style.display === 'block') {
                loadModal.style.display = 'none';
                setTimeout(() => {
                    loadModal.style.display = 'block';
                }, 200);
            }
        }
        catch (error) {
            console.error('❌ Error forcing preset reload:', error);
        }
    }
    showMessage(message, type) {
        const messageEl = document.getElementById('uploadMessage');
        if (messageEl) {
            messageEl.textContent = message;
            messageEl.className = `upload-message ${type}`;
            messageEl.style.display = 'block';
        }
    }
}
// Global instance
export const uploadPresetModal = new UploadPresetModal();
//# sourceMappingURL=uploadPresetModal.js.map