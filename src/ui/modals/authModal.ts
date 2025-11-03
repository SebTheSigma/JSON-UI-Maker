// Authentication modal for signup/signin
export class AuthModal {
  private modal: HTMLElement | null = null;
  private isSignupMode = false;

  init(): void {
    this.createModal();
    this.setupEventListeners();
  }

  show(signup: boolean = false): void {
    this.isSignupMode = signup;
    this.updateModalContent();
    this.modal!.style.display = 'block';
  }

  hide(): void {
    this.modal!.style.display = 'none';
  }

  private createModal(): void {
    const modalHtml = `
      <div id="modalAuth" class="modal">
        <div class="modal-content" style="max-width: 400px;">
          <span id="modalAuthClose" class="modalClose" style="cursor: pointer;">&times;</span>
          <h2 class="modalHeader" id="authModalTitle">Sign In</h2>
          <div class="modalAuthForm">
            <form id="authForm">
              <div class="auth-form-group">
                <label for="username">Username:</label>
                <input type="text" id="username" name="username" required minlength="3">
              </div>

              <div class="auth-form-group">
                <label for="password">Password:</label>
                <input type="password" id="password" name="password" required minlength="6">
              </div>

              <div class="auth-form-buttons">
                <button type="submit" id="authSubmitBtn">Sign In</button>
                <button type="button" id="authToggleBtn">Need an account? Sign Up</button>
              </div>
            </form>

            <div id="authMessage" class="auth-message" style="display: none;"></div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    this.modal = document.getElementById('modalAuth');

    // Add CSS styles
    const style = document.createElement('style');
    style.textContent = `
      .auth-form-group {
        margin-bottom: 15px;
      }

      .auth-form-group label {
        display: block;
        margin-bottom: 5px;
        color: white;
        font-weight: 500;
      }

      .auth-form-group input {
        width: 100%;
        padding: 8px;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 14px;
      }

      .auth-form-buttons {
        display: flex;
        gap: 10px;
        margin-top: 20px;
      }

      .auth-form-buttons button {
        flex: 1;
        padding: 10px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
      }

      #authSubmitBtn {
        background-color: #007bff;
        color: white;
      }

      #authSubmitBtn:hover {
        background-color: #0056b3;
      }

      #authToggleBtn {
        background-color: #6c757d;
        color: white;
      }

      #authToggleBtn:hover {
        background-color: #545b62;
      }

      .auth-message {
        margin-top: 15px;
        padding: 10px;
        border-radius: 4px;
        text-align: center;
        font-weight: 500;
      }

      .auth-message.success {
        background-color: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
      }

      .auth-message.error {
        background-color: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
      }
    `;
    document.head.appendChild(style);
  }

  private setupEventListeners(): void {
    const closeBtn = document.getElementById('modalAuthClose');
    const form = document.getElementById('authForm') as HTMLFormElement;
    const toggleBtn = document.getElementById('authToggleBtn');

    closeBtn?.addEventListener('click', () => this.hide());
    toggleBtn?.addEventListener('click', () => this.toggleMode());
    form?.addEventListener('submit', (e) => this.handleSubmit(e));

    // Close modal when clicking outside
    this.modal?.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.hide();
      }
    });
  }

  private toggleMode(): void {
    this.isSignupMode = !this.isSignupMode;
    this.updateModalContent();
  }

  private updateModalContent(): void {
    const title = document.getElementById('authModalTitle');
    const submitBtn = document.getElementById('authSubmitBtn');
    const toggleBtn = document.getElementById('authToggleBtn');

    if (this.isSignupMode) {
      title!.textContent = 'Sign Up';
      submitBtn!.textContent = 'Sign Up';
      toggleBtn!.textContent = 'Already have an account? Sign In';
    } else {
      title!.textContent = 'Sign In';
      submitBtn!.textContent = 'Sign In';
      toggleBtn!.textContent = 'Need an account? Sign Up';
    }

    // Clear form and messages
    const form = document.getElementById('authForm') as HTMLFormElement;
    form.reset();
    this.hideMessage();
  }

  private async handleSubmit(e: Event): Promise<void> {
    e.preventDefault();

    const formData = new FormData(e.target as HTMLFormElement);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    try {
      const authManager = (window as any).authManager;
      let result;

      if (this.isSignupMode) {
        result = await authManager.signup(username, password);
      } else {
        result = await authManager.signin(username, password);
      }

      if (result.success) {
        this.showMessage(result.message, 'success');
        setTimeout(() => {
          this.hide();
          // Trigger UI update
          if ((window as any).Builder) {
            (window as any).Builder.updateAuthUI();
          }
        }, 1000);
      } else {
        this.showMessage(result.message, 'error');
      }
    } catch (error) {
      console.error('Auth error:', error);
      this.showMessage('An unexpected error occurred', 'error');
    }
  }

  private showMessage(message: string, type: 'success' | 'error'): void {
    const messageEl = document.getElementById('authMessage');
    if (messageEl) {
      messageEl.textContent = message;
      messageEl.className = `auth-message ${type}`;
      messageEl.style.display = 'block';
    }
  }

  private hideMessage(): void {
    const messageEl = document.getElementById('authMessage');
    if (messageEl) {
      messageEl.style.display = 'none';
    }
  }
}

// Global instance
export const authModal = new AuthModal();