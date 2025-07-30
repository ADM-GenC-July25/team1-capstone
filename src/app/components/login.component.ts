import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [FormsModule, CommonModule],
    template: `
    <div class="login-container" [attr.data-theme]="isDarkMode() ? 'dark' : null">
      <div class="login-card">
        <div class="login-header">
          <h1 class="login-title">Welcome to {{ appTitle }}</h1>
          <p class="login-subtitle">Sign in to continue shopping</p>
        </div>
        
        <form class="login-form" (ngSubmit)="onLogin()" #loginForm="ngForm">
          <div class="form-group">
            <label for="username" class="form-label">Username or Email</label>
            <input
              type="text"
              id="username"
              name="username"
              class="form-input"
              [(ngModel)]="username"
              placeholder="Enter your username"
              required
              #usernameInput="ngModel"
            >
            <div class="error-message" *ngIf="usernameInput.invalid && usernameInput.touched">
              Username is required
            </div>
          </div>
          
          <div class="form-group">
            <label for="password" class="form-label">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              class="form-input"
              [(ngModel)]="password"
              placeholder="Enter your password"
              required
              #passwordInput="ngModel"
            >
            <div class="error-message" *ngIf="passwordInput.invalid && passwordInput.touched">
              Password is required
            </div>
          </div>
          
          <div class="error-message" *ngIf="loginError()">
            {{ loginError() }}
          </div>
          
          <button
            type="submit"
            class="login-button"
            [disabled]="loginForm.invalid || isLoading()"
          >
            <span *ngIf="!isLoading()">Sign In</span>
            <span *ngIf="isLoading()">Signing in...</span>
          </button>
        </form>
        
        <div class="login-footer">
          <div class="demo-info">
            <h3>Demo Login</h3>
            <p>This is a template login. Use any username and password to continue.</p>
            <div class="demo-credentials">
              <p><strong>Quick Login:</strong></p>
              <button class="demo-button" (click)="quickLogin('demo', 'password')">
                Demo User
              </button>
              <button class="demo-button" (click)="quickLogin('admin', 'admin123')">
                Admin User
              </button>
            </div>
          </div>
          
          <button class="theme-toggle-login" (click)="toggleTheme()">
            <span class="theme-icon">{{ isDarkMode() ? '☀️' : '🌙' }}</span>
            {{ isDarkMode() ? 'Light Mode' : 'Dark Mode' }}
          </button>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    [data-theme="dark"] .login-container {
      background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
    }

    .login-card {
      background: white;
      border-radius: 20px;
      padding: 3rem;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 450px;
      transition: all 0.3s ease;
    }

    [data-theme="dark"] .login-card {
      background: #374151;
      color: #f9fafb;
    }

    .login-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .login-title {
      font-size: 2rem;
      color: #1f2937;
      margin-bottom: 0.5rem;
      font-weight: 700;
    }

    [data-theme="dark"] .login-title {
      color: #f9fafb;
    }

    .login-subtitle {
      color: #6b7280;
      font-size: 1rem;
    }

    [data-theme="dark"] .login-subtitle {
      color: #d1d5db;
    }

    .login-form {
      margin-bottom: 2rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-label {
      display: block;
      margin-bottom: 0.5rem;
      color: #374151;
      font-weight: 600;
      font-size: 0.9rem;
    }

    [data-theme="dark"] .form-label {
      color: #f9fafb;
    }

    .form-input {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #e5e7eb;
      border-radius: 10px;
      font-size: 1rem;
      transition: all 0.3s ease;
      background: white;
    }

    .form-input:focus {
      outline: none;
      border-color: #4f46e5;
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
    }

    [data-theme="dark"] .form-input {
      background: #4b5563;
      border-color: #6b7280;
      color: #f9fafb;
    }

    [data-theme="dark"] .form-input:focus {
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }

    .error-message {
      color: #ef4444;
      font-size: 0.875rem;
      margin-top: 0.5rem;
    }

    .login-button {
      width: 100%;
      background: #4f46e5;
      color: white;
      border: none;
      padding: 14px;
      border-radius: 10px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-top: 1rem;
    }

    .login-button:hover:not(:disabled) {
      background: #4338ca;
      transform: translateY(-1px);
    }

    .login-button:disabled {
      background: #9ca3af;
      cursor: not-allowed;
      transform: none;
    }

    .login-footer {
      text-align: center;
    }

    .demo-info {
      background: #f8fafc;
      padding: 1.5rem;
      border-radius: 10px;
      margin-bottom: 1rem;
    }

    [data-theme="dark"] .demo-info {
      background: #4b5563;
    }

    .demo-info h3 {
      color: #4f46e5;
      margin-bottom: 0.5rem;
      font-size: 1.1rem;
    }

    [data-theme="dark"] .demo-info h3 {
      color: #6366f1;
    }

    .demo-info p {
      color: #6b7280;
      font-size: 0.9rem;
      margin-bottom: 1rem;
    }

    [data-theme="dark"] .demo-info p {
      color: #d1d5db;
    }

    .demo-credentials {
      display: flex;
      gap: 0.5rem;
      flex-direction: column;
      align-items: center;
    }

    .demo-credentials p {
      margin-bottom: 0.5rem;
      font-weight: 600;
    }

    .demo-button {
      background: #10b981;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 0.875rem;
      cursor: pointer;
      transition: background 0.3s ease;
      margin: 0 0.25rem;
    }

    .demo-button:hover {
      background: #059669;
    }

    .theme-toggle-login {
      background: #6b7280;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 0 auto;
    }

    .theme-toggle-login:hover {
      background: #4b5563;
    }

    .theme-icon {
      font-size: 1rem;
    }

    @media (max-width: 480px) {
      .login-container {
        padding: 1rem;
      }
      
      .login-card {
        padding: 2rem;
      }
      
      .login-title {
        font-size: 1.5rem;
      }
      
      .demo-credentials {
        flex-direction: column;
        gap: 0.5rem;
      }
    }
  `]
})
export class LoginComponent {
    username = '';
    password = '';
    appTitle = 'ShopMart';

    loginError = signal<string>('');
    isLoading = signal(false);
    isDarkMode = signal(false);

    constructor(
        private authService: AuthService,
        private router: Router
    ) {
        // Check if dark mode was previously set
        this.checkDarkMode();
    }

    onLogin(): void {
        if (!this.username.trim() || !this.password.trim()) {
            this.loginError.set('Please enter both username and password');
            return;
        }

        this.isLoading.set(true);
        this.loginError.set('');

        // Simulate loading delay for better UX
        setTimeout(() => {
            const success = this.authService.login(this.username, this.password);

            if (success) {
                this.router.navigate(['/']);
            } else {
                this.loginError.set('Please enter valid credentials');
            }

            this.isLoading.set(false);
        }, 800);
    }

    quickLogin(username: string, password: string): void {
        this.username = username;
        this.password = password;
        this.onLogin();
    }

    toggleTheme(): void {
        this.isDarkMode.set(!this.isDarkMode());

        // Apply theme to document root
        if (this.isDarkMode()) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('darkMode', 'true');
        } else {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('darkMode', 'false');
        }
    }

    private checkDarkMode(): void {
        const darkMode = localStorage.getItem('darkMode');
        if (darkMode === 'true') {
            this.isDarkMode.set(true);
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    }
}
