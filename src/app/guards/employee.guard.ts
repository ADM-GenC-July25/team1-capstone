import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.authService.isAuthenticated() && (this.authService.isAdmin() || this.authService.isEmployee())) {
      return true;
    }
    this.router.navigate(['/']);
    return false;
  }
}