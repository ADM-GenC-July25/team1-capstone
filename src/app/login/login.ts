import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [FormsModule, CommonModule],
    templateUrl: 'login.html',
    styleUrl: './login.css',
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
