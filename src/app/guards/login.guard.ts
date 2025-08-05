import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
    providedIn: 'root'
})
export class LoginGuard implements CanActivate {
    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    canActivate(): boolean {
        // If user is already authenticated, redirect them to main page
        if (this.authService.isAuthenticated()) {
            this.router.navigate(['/']);
            return false;
        } else {
            // User is not authenticated, allow access to login
            return true;
        }
    }
}
