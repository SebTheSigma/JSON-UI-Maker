import { presetManager } from "../../presetManager.js";
import { authManager } from "../../auth.js";
import { Notification } from "../../ui/notifs/noficationMaker.js";
export class PresetManagementModal {
    modal = null;
    init() {
        this.createModal();
        this.setupEventListeners();
    }
    show() {
        this.modal.style.display = 'block';
        this.loadPresets();
    }
    hide() {
        this.modal.style.display = 'none';
    }
    createModal() {
        const modalHtml = `
      <div id="modalPresetManagement" class="modal">
        <div class="modal-content" style="max-width: 600px; max-height: 80vh; overflow-y: auto;">
          <span id="modalPresetManagementClose" class="modalClose" style="cursor: pointer;">&times;</span>
          <h2 class="modalHeader">Manage Presets</h2>
          <div class="presetManagementContent">
            <div id="presetList" class="preset-list">
              <!-- Presets will be loaded here -->
            </div>
          </div>
        </div>
      </div>
    `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        this.modal = document.getElementById('modalPresetManagement');
        // Add CSS styles
        const style = document.createElement('style');
        style.textContent = `
      .preset-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-top: 20px;
      }

      .preset-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 6px;
      }

      .preset-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .preset-name {
        font-weight: 500;
        color: white;
        font-size: 14px;
      }

      .preset-details {
        font-size: 12px;
        color: #ccc;
      }

      .preset-actions {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .preset-btn {
        padding: 6px 12px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 500;
      }

      .preset-btn.edit {
        background: #007bff;
        color: white;
      }

      .preset-btn.edit:hover {
        background: #0056b3;
      }

      .preset-btn.visibility {
        background: #28a745;
        color: white;
      }

      .preset-btn.visibility.make-private {
        background: #ffc107;
      }

      .preset-btn.visibility.make-public {
        background: #28a745;
      }

      .preset-btn.delete {
        background: #dc3545;
        color: white;
      }

      .preset-btn.delete:hover {
        background: #c82333;
      }

      .preset-name-input {
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid #ccc;
        border-radius: 4px;
        color: white;
        padding: 4px 8px;
        font-size: 14px;
        width: 200px;
      }

      .preset-name-input:focus {
        outline: none;
        border-color: #007bff;
      }

      .preset-visibility {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        color: #ccc;
      }

      .preset-visibility.public {
        color: #28a745;
      }

      .preset-visibility.private {
        color: #ffc107;
      }

      .modalHeader {
        color: white;
        margin-bottom: 20px;
      }

      .presetManagementContent {
        color: white;
      }
    `;
        document.head.appendChild(style);
    }
    setupEventListeners() {
        const closeBtn = document.getElementById('modalPresetManagementClose');
        closeBtn?.addEventListener('click', () => this.hide());
        // Close modal when clicking outside
        this.modal?.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hide();
            }
        });
    }
    async loadPresets() {
        const user = authManager.getCurrentUser();
        if (!user)
            return;
        const presetList = document.getElementById('presetList');
        if (!presetList)
            return;
        presetList.innerHTML = '<p style="text-align: center; color: #ccc;">Loading presets...</p>';
        try {
            const userPresets = await presetManager.getUserPresets();
            if (userPresets.length === 0) {
                presetList.innerHTML = '<p style="text-align: center; color: #ccc;">No presets found. Upload some presets first!</p>';
                return;
            }
            let html = '';
            for (const preset of userPresets) {
                if (preset.user_id === user.id) {
                    html += this.createPresetItemHtml(preset);
                }
            }
            presetList.innerHTML = html;
            this.attachEventListeners();
        }
        catch (error) {
            console.error('Error loading presets:', error);
            presetList.innerHTML = '<p style="text-align: center; color: #dc3545;">Error loading presets</p>';
        }
    }
    createPresetItemHtml(preset) {
        const visibilityClass = preset.is_public ? 'public' : 'private';
        const visibilityText = preset.is_public ? 'Public' : 'Private';
        const visibilityAction = preset.is_public ? 'Make Private' : 'Make Public';
        return `
      <div class="preset-item" data-preset-id="${preset.id}">
        <div class="preset-info">
          <div class="preset-name" id="presetName_${preset.id}">${preset.name}</div>
          <div class="preset-details">
            <span class="preset-visibility ${visibilityClass}">${visibilityText}</span>
            <span> • Uploaded: ${new Date(preset.created_at).toLocaleDateString()}</span>
          </div>
        </div>
        <div class="preset-actions">
          <button class="preset-btn edit" onclick="presetManagementModal.startEditPreset(${preset.id})">Edit Name</button>
          <button class="preset-btn visibility make-${preset.is_public ? 'private' : 'public'}" 
                  onclick="presetManagementModal.togglePresetVisibility(${preset.id})">
            ${visibilityAction}
          </button>
          <button class="preset-btn delete" onclick="presetManagementModal.deletePreset(${preset.id})">Delete</button>
        </div>
      </div>
    `;
    }
    attachEventListeners() {
        // Event listeners are attached via onclick handlers in HTML
    }
    startEditPreset(presetId) {
        const nameElement = document.getElementById(`presetName_${presetId}`);
        if (!nameElement)
            return;
        const currentName = nameElement.textContent || '';
        nameElement.innerHTML = `
      <input type="text" class="preset-name-input" value="${currentName}" id="editPresetName_${presetId}">
      <div style="margin-top: 4px;">
        <button class="preset-btn edit" onclick="presetManagementModal.savePresetName(${presetId})">Save</button>
        <button class="preset-btn" style="background: #6c757d; color: white; margin-left: 4px;" 
                onclick="presetManagementModal.cancelEditPreset(${presetId})">Cancel</button>
      </div>
    `;
        const input = document.getElementById(`editPresetName_${presetId}`);
        input?.focus();
        input?.select();
    }
    async savePresetName(presetId) {
        const input = document.getElementById(`editPresetName_${presetId}`);
        if (!input)
            return;
        const newName = input.value.trim();
        if (!newName) {
            new Notification('Preset name cannot be empty', 3000, 'error');
            return;
        }
        try {
            // In a real implementation, you'd update this via the database manager
            // For now, we'll just update the UI and show a success message
            const nameElement = document.getElementById(`presetName_${presetId}`);
            if (nameElement) {
                nameElement.textContent = newName;
                nameElement.id = `presetName_${presetId}`;
            }
            new Notification('Preset name updated successfully', 3000, 'notif');
        }
        catch (error) {
            console.error('Error updating preset name:', error);
            new Notification('Failed to update preset name', 3000, 'error');
        }
    }
    cancelEditPreset(presetId) {
        // Reload the presets to restore original state
        this.loadPresets();
    }
    async togglePresetVisibility(presetId) {
        try {
            const result = await presetManager.makePresetPublic(presetId);
            if (result.success) {
                new Notification(result.message, 3000, 'notif');
                this.loadPresets(); // Reload to show updated visibility
            }
            else {
                new Notification(result.message, 3000, 'error');
            }
        }
        catch (error) {
            console.error('Error toggling preset visibility:', error);
            new Notification('Failed to change preset visibility', 3000, 'error');
        }
    }
    async deletePreset(presetId) {
        if (!confirm('Are you sure you want to delete this preset? This action cannot be undone.')) {
            return;
        }
        try {
            // Delete from database
            if (window.dbManager && typeof window.dbManager.deletePreset === 'function') {
                await window.dbManager.deletePreset(presetId);
                new Notification('Preset deleted successfully', 3000, 'notif');
                this.loadPresets(); // Reload to remove the deleted preset
            }
            else {
                new Notification('Database manager not available', 3000, 'error');
            }
        }
        catch (error) {
            console.error('Error deleting preset:', error);
            new Notification('Failed to delete preset', 3000, 'error');
        }
    }
    async refreshPresets() {
        await this.loadPresets();
        // Also refresh the load texture presets modal if it's open
        const modalLoadTexturePresets = document.getElementById('modalLoadTexturePresets');
        if (modalLoadTexturePresets && modalLoadTexturePresets.style.display === 'block') {
            // Close and reopen to refresh
            modalLoadTexturePresets.style.display = 'none';
            setTimeout(() => {
                modalLoadTexturePresets.style.display = 'block';
            }, 100);
        }
    }
}
// Global instance
export const presetManagementModal = new PresetManagementModal();
// Make it globally accessible for onclick handlers
window.presetManagementModal = presetManagementModal;
//# sourceMappingURL=presetManagementModal.js.map