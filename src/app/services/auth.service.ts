import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private isLoggedIn = signal(false);
    private currentUser = signal<string | null>(null);

    // Getter signals for components to access
    get isAuthenticated() {
        return this.isLoggedIn.asReadonly();
    }

    get user() {
        return this.currentUser.asReadonly();
    }

    // Template login - accepts any credentials
    login(username: string, password: string): boolean {
        // Template implementation - always succeeds if both fields have values
        if (username.trim() && password.trim()) {
            this.isLoggedIn.set(true);
            this.currentUser.set(username);

            // Store in sessionStorage for persistence during session
            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('currentUser', username);

            console.log('Login successful (template mode):', username);
            return true;
        }

        console.log('Login failed: Username and password are required');
        return false;
    }

    logout(): void {
        this.isLoggedIn.set(false);
        this.currentUser.set(null);

        // Clear sessionStorage
        sessionStorage.removeItem('isLoggedIn');
        sessionStorage.removeItem('currentUser');

        console.log('User logged out');
    }

    // Check if user is already logged in (from sessionStorage)
    checkAuthStatus(): void {
        const isLoggedIn = sessionStorage.getItem('isLoggedIn');
        const currentUser = sessionStorage.getItem('currentUser');

        if (isLoggedIn === 'true' && currentUser) {
            this.isLoggedIn.set(true);
            this.currentUser.set(currentUser);
        }
    }
}
