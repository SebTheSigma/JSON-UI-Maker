// Authentication management
export interface User {
  id: number;
  username: string;
}

class AuthManager {
  private currentUser: User | null = null;
  private readonly STORAGE_KEY = 'json_ui_builder_user';

  init(): void {
    // Load user from localStorage
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        this.currentUser = JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse stored user:', e);
        this.logout();
      }
    }
  }

  async signup(username: string, password: string): Promise<{ success: boolean; message: string }> {
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
      const existingUser = await (window as any).dbManager.getUser(username);
      if (existingUser) {
        return { success: false, message: 'Username already exists' };
      }

      // Create user
      const user = await (window as any).dbManager.createUser(username, password);
      this.currentUser = { id: user.id, username: user.username };
      this.saveToStorage();

      // Update UI immediately
      if ((window as any).Builder) {
          (window as any).Builder.updateAuthUI();
      }

      return { success: true, message: 'Account created successfully' };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, message: 'Failed to create account' };
    }
  }

  async signin(username: string, password: string): Promise<{ success: boolean; message: string }> {
    if (!username || !password) {
      return { success: false, message: 'Username and password are required' };
    }

    try {
      const user = await (window as any).dbManager.authenticateUser(username, password);
      if (user) {
        this.currentUser = { id: user.id, username: user.username };
        this.saveToStorage();

        // Update UI immediately
        if ((window as any).Builder) {
            (window as any).Builder.updateAuthUI();
        }

        return { success: true, message: 'Signed in successfully' };
      } else {
        return { success: false, message: 'Invalid username or password' };
      }
    } catch (error) {
      console.error('Signin error:', error);
      return { success: false, message: 'Failed to sign in' };
    }
  }

  logout(): void {
    this.currentUser = null;
    localStorage.removeItem(this.STORAGE_KEY);
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  private saveToStorage(): void {
    if (this.currentUser) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.currentUser));
    }
  }
}

// Global instance
export const authManager = new AuthManager();