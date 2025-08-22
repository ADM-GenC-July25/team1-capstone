import { Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { ThemeService } from '../services/theme.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: 'login-new.html',
    styleUrl: './login.css',
})
export class LoginComponent {
    appTitle = 'ByteBazaar';

    protected get isDarkMode() {
        return this.themeService.isDarkMode;
    }

    constructor(
        private authService: AuthService,
        private router: Router,
        private themeService: ThemeService
    ) { }

    onLogin(): void {
        // Redirect to Cognito for authentication
        this.authService.login();
    }

    onRegister(): void {
        // For now, redirect to register page
        // In the future, this could also redirect to Cognito with sign-up flow
        this.router.navigate(['/register']);
    }

    toggleTheme() {
        this.themeService.toggleTheme();
    }
}
