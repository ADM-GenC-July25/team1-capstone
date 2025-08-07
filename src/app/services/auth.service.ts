import { Injectable, signal } from '@angular/core';
import { AuthUser, LoginRequest, LoginResponse } from '../models';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private isLoggedIn = signal(false);
    private currentUser = signal<AuthUser | null>(null);

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
            // Create a mock AuthUser for template purposes
            const mockUser: AuthUser = {
                id: '1',
                email: username,
                firstName: 'Template',
                lastName: 'User',
                token: 'mock-jwt-token',
                roles: ['customer'],
                permissions: ['read:products', 'write:cart']
            };

            this.isLoggedIn.set(true);
            this.currentUser.set(mockUser);

            // Store in sessionStorage for persistence during session
            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('currentUser', JSON.stringify(mockUser));

            console.log('Login successful (template mode):', mockUser);
            return true;
        }

        console.log('Login failed: Username and password are required');
        return false;
    }

    // Check if user is already logged in (from sessionStorage)
    checkAuthStatus(): void {
        const isLoggedIn = sessionStorage.getItem('isLoggedIn');
        const currentUserJson = sessionStorage.getItem('currentUser');

    if(isLoggedIn === 'true' && currentUserJson) {
    try {
        const currentUser = JSON.parse(currentUserJson) as AuthUser;
        this.isLoggedIn.set(true);
        this.currentUser.set(currentUser);
    } catch (error) {
        console.error('Error parsing stored user data:', error);
        this.logout();
    }
} else {
    // If no valid session, ensure user is logged out
    this.logout();
}
    }

    // Logout method to clear user session and signals
    logout(): void {
        this.isLoggedIn.set(false);
        this.currentUser.set(null);
        sessionStorage.removeItem('isLoggedIn');
        sessionStorage.removeItem('currentUser');
    }

// Force logout with history clearing
forceLogout(): void {
    this.logout();
    // Clear all storage to be extra sure
    sessionStorage.clear();
    localStorage.removeItem('darkMode'); // Preserve dark mode setting
    const darkMode = localStorage.getItem('darkMode');
    localStorage.clear();
    if(darkMode) localStorage.setItem('darkMode', darkMode);
}
}
