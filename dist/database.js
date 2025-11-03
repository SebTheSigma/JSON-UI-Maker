// Client-side database using IndexedDB with SQLite-like interface
// Using sql.js for client-side SQLite
class DatabaseManager {
    db = null;
    SQL = null;
    STORAGE_KEY = 'json_ui_database';
    MANUAL_DATA_KEY = 'json_ui_manual_data';
    presetsCache = [];
    usersCache = [];
    async init() {
        // Load sql.js
        const sqlPromise = window.initSqlJs({
            locateFile: (file) => `https://sql.js.org/dist/${file}`
        });
        this.SQL = await sqlPromise;
        // Initialize database
        this.db = new this.SQL.Database();
        // Try to load manual data first (more reliable)
        this.loadManualData();
        // Create tables
        this.createTables();
        // If we have manual data, restore it
        if (this.presetsCache.length > 0 || this.usersCache.length > 0) {
            console.log('🗄️ DB: Restoring data from manual cache');
            this.restoreDataToDatabase();
        }
    }
    loadManualData() {
        try {
            const manualData = localStorage.getItem(this.MANUAL_DATA_KEY);
            if (manualData) {
                const parsed = JSON.parse(manualData);
                this.presetsCache = parsed.presets || [];
                this.usersCache = parsed.users || [];
                console.log('🗄️ DB: Loaded manual data - presets:', this.presetsCache.length, 'users:', this.usersCache.length);
            }
        }
        catch (e) {
            console.error('❌ DB: Failed to load manual data:', e);
        }
    }
    restoreDataToDatabase() {
        try {
            // Restore users
            for (const user of this.usersCache) {
                try {
                    const stmt = this.db.prepare(`
            INSERT OR IGNORE INTO users (id, username, password_hash, created_at)
            VALUES (?, ?, ?, ?)
          `);
                    stmt.run([user.id, user.username, user.password_hash, user.created_at]);
                }
                catch (e) {
                    console.warn('🗄️ DB: User restore warning:', e);
                }
            }
            // Restore presets
            for (const preset of this.presetsCache) {
                try {
                    const stmt = this.db.prepare(`
            INSERT OR IGNORE INTO presets (id, user_id, name, png_path, json_path, is_public, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `);
                    stmt.run([preset.id, preset.user_id, preset.name, preset.png_path, preset.json_path, preset.is_public ? 1 : 0, preset.created_at]);
                }
                catch (e) {
                    console.warn('🗄️ DB: Preset restore warning:', e);
                }
            }
            console.log('🗄️ DB: Data restoration completed');
        }
        catch (e) {
            console.error('❌ DB: Failed to restore data:', e);
        }
    }
    saveManualData() {
        try {
            // Update cache from database
            const presetsQuery = this.db.exec("SELECT * FROM presets");
            const usersQuery = this.db.exec("SELECT * FROM users");
            this.presetsCache = (presetsQuery.values || []).map((row) => ({
                id: row[0],
                user_id: row[1],
                name: row[2],
                png_path: row[3],
                json_path: row[4],
                is_public: row[5] === 1,
                created_at: row[6]
            }));
            this.usersCache = (usersQuery.values || []).map((row) => ({
                id: row[0],
                username: row[1],
                password_hash: row[2],
                created_at: row[3]
            }));
            // Save to localStorage
            const manualData = {
                presets: this.presetsCache,
                users: this.usersCache,
                timestamp: Date.now()
            };
            localStorage.setItem(this.MANUAL_DATA_KEY, JSON.stringify(manualData));
            console.log('🗄️ DB: Saved manual data - presets:', this.presetsCache.length, 'users:', this.usersCache.length);
        }
        catch (e) {
            console.error('❌ DB: Failed to save manual data:', e);
        }
    }
    createTables() {
        // Users table
        this.db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
        // Presets table
        this.db.run(`
      CREATE TABLE IF NOT EXISTS presets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        png_path TEXT NOT NULL,
        json_path TEXT NOT NULL,
        is_public BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);
        // Create indexes
        this.db.run(`CREATE INDEX IF NOT EXISTS idx_presets_user_id ON presets(user_id)`);
        this.db.run(`CREATE INDEX IF NOT EXISTS idx_presets_public ON presets(is_public)`);
    }
    // User management
    async createUser(username, password) {
        const password_hash = this.hashPassword(password);
        const stmt = this.db.prepare(`
      INSERT INTO users (username, password_hash)
      VALUES (?, ?)
    `);
        stmt.run([username, password_hash]);
        const result = this.db.exec("SELECT last_insert_rowid() as id");
        const id = result[0].values[0][0];
        this.save(); // Save after user creation
        return {
            id: id,
            username,
            password_hash,
            created_at: new Date().toISOString()
        };
    }
    async getUser(username) {
        const stmt = this.db.prepare("SELECT * FROM users WHERE username = ?");
        const result = stmt.getAsObject([username]);
        if (!result.id)
            return null;
        return {
            id: result.id,
            username: result.username,
            password_hash: result.password_hash,
            created_at: result.created_at
        };
    }
    async authenticateUser(username, password) {
        const user = await this.getUser(username);
        if (!user)
            return null;
        if (this.verifyPassword(password, user.password_hash)) {
            return user;
        }
        return null;
    }
    // Preset management
    async createPreset(userId, name, pngPath, jsonPath, isPublic = false) {
        console.log('🗄️ DB: Creating new preset...');
        console.log('🗄️ DB: User ID:', userId);
        console.log('🗄️ DB: Name:', name);
        console.log('🗄️ DB: PNG Path:', pngPath);
        console.log('🗄️ DB: JSON Path:', jsonPath);
        console.log('🗄️ DB: Is Public:', isPublic);
        // Check existing presets
        const existingPresets = await this.getUserPresets(userId);
        console.log('🗄️ DB: Existing presets:', existingPresets.length, existingPresets.map(p => p.name));
        // Get next ID (max ID + 1)
        let nextId = 1;
        if (this.presetsCache.length > 0) {
            nextId = Math.max(...this.presetsCache.map(p => p.id)) + 1;
        }
        const newPreset = {
            id: nextId,
            user_id: userId,
            name,
            png_path: pngPath,
            json_path: jsonPath,
            is_public: isPublic,
            created_at: new Date().toISOString()
        };
        // Add to SQL database
        const stmt = this.db.prepare(`
      INSERT INTO presets (id, user_id, name, png_path, json_path, is_public, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
        stmt.run([newPreset.id, newPreset.user_id, newPreset.name, newPreset.png_path, newPreset.json_path, newPreset.is_public ? 1 : 0, newPreset.created_at]);
        console.log('🗄️ DB: Insert successful, new preset ID:', newPreset.id);
        // Add to manual cache
        this.presetsCache.push(newPreset);
        // Save manual data
        this.saveManualData();
        console.log('🗄️ DB: Created preset successfully:', newPreset);
        return newPreset;
    }
    async getUserPresets(userId) {
        try {
            console.log('🗄️ DB: Getting presets for user ID:', userId);
            // Return from manual cache - this should be more reliable
            const userPresets = this.presetsCache.filter(p => p.user_id === userId);
            const publicPresets = this.presetsCache.filter(p => p.is_public);
            const allPresets = [...userPresets, ...publicPresets];
            console.log('🗄️ DB: User presets:', userPresets.length, userPresets.map(p => p.name));
            console.log('🗄️ DB: Public presets:', publicPresets.length, publicPresets.map(p => p.name));
            console.log('🗄️ DB: Total presets:', allPresets.length, allPresets.map(p => p.name));
            return allPresets;
        }
        catch (error) {
            console.error('❌ DB: Error in getUserPresets:', error);
            return [];
        }
    }
    async getPublicPresets() {
        try {
            console.log('🗄️ DB: Getting public presets...');
            const publicPresets = this.presetsCache.filter(p => p.is_public);
            console.log('🗄️ DB: Public presets:', publicPresets.length, publicPresets.map(p => p.name));
            return publicPresets;
        }
        catch (error) {
            console.error('❌ DB: Error in getPublicPresets:', error);
            return [];
        }
    }
    async updatePreset(presetId, updates) {
        try {
            // Find preset in cache
            const presetIndex = this.presetsCache.findIndex(p => p.id === presetId);
            if (presetIndex === -1) {
                throw new Error('Preset not found');
            }
            // Update preset in cache
            const preset = this.presetsCache[presetIndex];
            if (preset && updates.is_public !== undefined) {
                preset.is_public = updates.is_public;
            }
            if (preset && updates.name !== undefined) {
                preset.name = updates.name;
            }
            // Update in SQL database
            let query = 'UPDATE presets SET ';
            const params = [];
            const updateFields = [];
            if (updates.is_public !== undefined) {
                updateFields.push('is_public = ?');
                params.push(updates.is_public ? 1 : 0);
            }
            if (updates.name !== undefined) {
                updateFields.push('name = ?');
                params.push(updates.name);
            }
            if (updateFields.length === 0)
                return;
            query += updateFields.join(', ') + ' WHERE id = ?';
            params.push(presetId);
            const stmt = this.db.prepare(query);
            stmt.run(params);
            // Save manual data
            this.saveManualData();
            console.log('🗄️ DB: Updated preset:', presetId, updates);
        }
        catch (error) {
            console.error('❌ DB: Error updating preset:', error);
            throw error;
        }
    }
    async deletePreset(presetId) {
        try {
            // Remove from cache
            const presetIndex = this.presetsCache.findIndex(p => p.id === presetId);
            if (presetIndex !== -1) {
                const deletedPreset = this.presetsCache.splice(presetIndex, 1)[0];
                if (deletedPreset) {
                    console.log('🗄️ DB: Deleted preset from cache:', deletedPreset.name);
                }
            }
            // Remove from SQL database
            const stmt = this.db.prepare('DELETE FROM presets WHERE id = ?');
            stmt.run([presetId]);
            // Save manual data
            this.saveManualData();
            console.log('🗄️ DB: Deleted preset:', presetId);
        }
        catch (error) {
            console.error('❌ DB: Error deleting preset:', error);
            throw error;
        }
    }
    // Utility methods
    hashPassword(password) {
        // Simple hash for demo - in production use proper hashing
        return btoa(password);
    }
    verifyPassword(password, hash) {
        return this.hashPassword(password) === hash;
    }
    // Export/import database for persistence
    exportDatabase() {
        return this.db.export();
    }
    importDatabase(buffer) {
        this.db = new this.SQL.Database(buffer);
    }
    // Save database to localStorage with manual backup system
    save() {
        if (this.db) {
            try {
                console.log('🗄️ DB: Saving database to localStorage...');
                // Get all current data manually
                const presetsQuery = this.db.exec("SELECT * FROM presets ORDER BY id");
                const usersQuery = this.db.exec("SELECT * FROM users ORDER BY id");
                const presetsData = presetsQuery.values || [];
                const usersData = usersQuery.values || [];
                console.log('🗄️ DB: Current presets count:', presetsData.length, presetsData);
                console.log('🗄️ DB: Current users count:', usersData.length, usersData);
                // Backup old data before overwriting
                const oldData = localStorage.getItem(this.STORAGE_KEY);
                const backupKey = this.STORAGE_KEY + '_backup_' + Date.now();
                if (oldData) {
                    localStorage.setItem(backupKey, oldData);
                    console.log('🗄️ DB: Created backup at', backupKey);
                }
                // Store manual backup of all data
                const manualBackup = {
                    type: 'manual_backup',
                    timestamp: Date.now(),
                    presets: presetsData,
                    users: usersData
                };
                // Also use SQL.js export as backup
                const data = this.db.export();
                const uint8Array = new Uint8Array(data);
                let binary = '';
                for (let i = 0; i < uint8Array.length; i++) {
                    const byte = uint8Array[i];
                    if (byte !== undefined) {
                        binary += String.fromCharCode(byte);
                    }
                }
                const base64 = btoa(binary);
                const saveData = {
                    sqljs_export: base64,
                    manual_backup: manualBackup,
                    timestamp: Date.now()
                };
                console.log('🗄️ DB: Storing manual backup with', presetsData.length, 'presets');
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(saveData));
                console.log('🗄️ DB: Database save completed successfully');
            }
            catch (e) {
                console.error('❌ DB: Failed to save database:', e);
                if (e instanceof Error) {
                    console.error('❌ DB: Error details:', e.message, e.stack);
                }
            }
        }
    }
    // Cleanup
    close() {
        this.save();
        if (this.db) {
            this.db.close();
        }
    }
}
// Global instance
export const dbManager = new DatabaseManager();
// Load sql.js script dynamically
export function loadSqlJs() {
    return new Promise((resolve, reject) => {
        if (window.SQL) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://sql.js.org/dist/sql-wasm.js';
        script.onload = () => {
            window.initSqlJs({
                locateFile: (file) => `https://sql.js.org/dist/${file}`
            }).then((SQL) => {
                window.SQL = SQL;
                resolve();
            }).catch(reject);
        };
        script.onerror = reject;
        document.head.appendChild(script);
    });
}
//# sourceMappingURL=database.js.map