class AuthManager {
    currentUser = null;
    STORAGE_KEY = 'json_ui_builder_user';
    init() {
        // Load user from localStorage
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
            try {
                this.currentUser = JSON.parse(stored);
            }
            catch (e) {
                console.error('Failed to parse stored user:', e);
                this.logout();
            }
        }
    }
    async signup(username, password) {
        if (!username || !password) {
            return { success: false, message: 'Username and password are required' };
        }
        if (username.length < 3) {
            return { success: false, message: 'Username must be at least 3 characters' };
        }
        if (password.length < 6) {
            return { success: false, message: 'Password must be at least 6 characters' };
        }
        try {
            // Check if user already exists
            const existingUser = await window.dbManager.getUser(username);
            if (existingUser) {
                return { success: false, message: 'Username already exists' };
            }
            // Create user
            const user = await window.dbManager.createUser(username, password);
            this.currentUser = { id: user.id, username: user.username };
            this.saveToStorage();
            // Update UI immediately
            if (window.Builder) {
                window.Builder.updateAuthUI();
            }
            return { success: true, message: 'Account created successfully' };
        }
        catch (error) {
            console.error('Signup error:', error);
            return { success: false, message: 'Failed to create account' };
        }
    }
    async signin(username, password) {
        if (!username || !password) {
            return { success: false, message: 'Username and password are required' };
        }
        try {
            const user = await window.dbManager.authenticateUser(username, password);
            if (user) {
                this.currentUser = { id: user.id, username: user.username };
                this.saveToStorage();
                // Update UI immediately
                if (window.Builder) {
                    window.Builder.updateAuthUI();
                }
                return { success: true, message: 'Signed in successfully' };
            }
            else {
                return { success: false, message: 'Invalid username or password' };
            }
        }
        catch (error) {
            console.error('Signin error:', error);
            return { success: false, message: 'Failed to sign in' };
        }
    }
    logout() {
        this.currentUser = null;
        localStorage.removeItem(this.STORAGE_KEY);
    }
    getCurrentUser() {
        return this.currentUser;
    }
    isAuthenticated() {
        return this.currentUser !== null;
    }
    saveToStorage() {
        if (this.currentUser) {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.currentUser));
        }
    }
}
// Global instance
export const authManager = new AuthManager();
//# sourceMappingURL=auth.js.map