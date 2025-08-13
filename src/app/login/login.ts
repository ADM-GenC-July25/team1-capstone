import { Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { ThemeService } from '../services/theme.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [FormsModule, CommonModule, RouterLink],
    templateUrl: 'login.html',
    styleUrl: './login.css',
})
export class LoginComponent {
    username = '';
    password = '';
    appTitle = 'ByteBazaar';

    loginError = signal<string>('');
    isLoading = signal(false);
protected get isDarkMode() {
        return this.themeService.isDarkMode;
    }
    constructor(
        private authService: AuthService,
        private router: Router,
        private themeService: ThemeService
    ) {}

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
     toggleTheme() {
    this.themeService.toggleTheme();
  }

}
