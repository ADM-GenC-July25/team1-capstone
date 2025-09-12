import { Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
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
        private themeService: ThemeService,
        private http: HttpClient
    ) { }

    onLogin(): void {
        if (!this.username.trim() || !this.password.trim()) {
            this.loginError.set('Please enter both username and password');
            return;
        }

        this.isLoading.set(true);
        this.loginError.set('');

        // Prepare login request payload
        const loginData = {
            username: this.username.trim(),
            password: this.password.trim()
        };

        // Send login request to backend
        this.http.post<any>('http://978323-api-gateway.eba-ykmz27pv.us-west-2.elasticbeanstalk.com/auth/login', loginData).subscribe({
            next: (response) => {
                this.isLoading.set(false);

                // Handle successful login
                if (response && (response.token || response.user)) {
                    // Store authentication token if provided
                    if (response.token) {
                        localStorage.setItem('authToken', response.token);
                    }

                    // Update auth service with user data
                    if (this.authService.login(this.username, this.password)) {
                        // If response includes user data, update it
                        if (response.user) {
                            sessionStorage.setItem('currentUser', JSON.stringify(response.user));
                        }

                        // Navigate to main page
                        this.router.navigate(['/main']);
                    } else {
                        this.loginError.set('Authentication failed');
                    }
                } else {
                    this.loginError.set('Invalid response from server');
                }
            },
            error: (error) => {
                this.isLoading.set(false);

                // Handle login errors
                if (error.status === 401) {
                    this.loginError.set('Invalid username or password');
                } else if (error.status === 400) {
                    this.loginError.set('Please check your input and try again');
                } else if (error.status === 0) {
                    this.loginError.set('Unable to connect to server. Please check your connection.');
                } else {
                    this.loginError.set('Login failed. Please try again later.');
                }

                console.error('Login error:', error);
            }
        });
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
