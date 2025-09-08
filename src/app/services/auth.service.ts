import { Injectable, signal, computed } from '@angular/core';
import { AuthUser, LoginRequest, LoginResponse } from '../models';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private isLoggedIn = localStorage.getItem('isLoggedIn') === 'true' ? signal(true) : signal(false);
    private currentUser = signal<AuthUser | null>(null);

    // Getter signals for components to access
    get isAuthenticated() {
        return this.isLoggedIn.asReadonly();
    }

    get user() {
        return this.currentUser.asReadonly();
    }
       hasRole(role: string): boolean {
  const user = this.currentUser();
  return user?.roles.includes(role) || false;
}

isAdmin(): boolean {
  return this.hasRole('admin') || this.hasRole('ADMIN');
}

isEmployee(): boolean {
  return this.hasRole('employee') || this.hasRole('EMPLOYEE');
}

isUser(): boolean {
  return this.hasRole('user') || this.hasRole('customer');
}

getUserRole(): string | null {
  const user = this.currentUser();
  return user?.roles[0] || null;
}

    // Computed signal for user's display name (username)
    get userDisplayName() {
        return computed(() => {
            const user = this.currentUser();
            if (user) {
                return user.username;
            }
            return null;
        });
    }

    // Computed signal for user's initials (for avatars)
    get userInitials() {
        return computed(() => {
            const user = this.currentUser();
            if (user && user.firstName && user.lastName) {
                return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
            } else if (user && user.username) {
                return user.username.charAt(0).toUpperCase();
            }
            return 'U';
        });
    }

    // Get current user's email
    get userEmail() {
        return computed(() => {
            const user = this.currentUser();
            return user?.email || null;
        });
    }

    // Method to handle successful login response from backend
    handleLoginSuccess(loginResponse: { token: string; username: string; email: string; accessLevel: string }): void {
        // Create AuthUser from backend response
        const authUser: AuthUser = {
            id: loginResponse.username, // Using username as ID since backend doesn't provide separate ID
            email: loginResponse.email,
            username: loginResponse.username,
            firstName: '', // Backend doesn't provide this, will be empty
            lastName: '', // Backend doesn't provide this, will be empty
            token: loginResponse.token,
            roles: [loginResponse.accessLevel], // Using accessLevel as role
            permissions: [] // Backend doesn't provide permissions
        };

        this.isLoggedIn.set(true);
        this.currentUser.set(authUser);

        // Store in sessionStorage for persistence during session
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('currentUser', JSON.stringify(authUser));
        sessionStorage.setItem('authToken', loginResponse.token);

        console.log('Login successful:', authUser);
    }

    // Template login - accepts any credentials
    login(username: string, password: string): boolean {
        // Template implementation - always succeeds if both fields have values
        if (username.trim() && password.trim()) {
            // Create a mock AuthUser for template purposes
            const mockUser: AuthUser = {
                id: '1',
                email: username,
                username: username, // Use the provided username
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

        if (isLoggedIn === 'true' && currentUserJson) {
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
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('isLoggedIn');
        sessionStorage.removeItem('currentUser');
        sessionStorage.removeItem('authToken');
    }

    // Force logout with history clearing
    forceLogout(): void {
        this.logout();
        // Clear all storage to be extra sure
        sessionStorage.clear();
        localStorage.removeItem('darkMode'); // Preserve dark mode setting
        const darkMode = localStorage.getItem('darkMode');
        localStorage.clear();
        if (darkMode) localStorage.setItem('darkMode', darkMode);
    }
}