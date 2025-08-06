import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private darkMode = signal(false);

    // Readonly signal that components can subscribe to
    get isDarkMode() {
        return this.darkMode.asReadonly();
    }

    constructor() {
        // Check for saved theme preference on service initialization
        this.loadThemePreference();
    }

    toggleTheme(): void {
        this.darkMode.set(!this.darkMode());
        this.saveThemePreference();
    }

    setTheme(isDark: boolean): void {
        this.darkMode.set(isDark);
        this.saveThemePreference();
    }

    private loadThemePreference(): void {
        const savedTheme = localStorage.getItem('darkMode');
        if (savedTheme === 'true') {
            this.darkMode.set(true);
        }
    }

    private saveThemePreference(): void {
        localStorage.setItem('darkMode', this.darkMode().toString());
    }
}

