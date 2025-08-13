import { Component, signal } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ThemeService } from '../services/theme.service';
import { Router, RouterModule, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  imports: [FormsModule, CommonModule, RouterModule, RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  protected readonly title = signal('ByteBazaar');
  protected searchQuery = signal('');

  // Access to theme service for conditional logo
  protected get isDarkMode() {
    return this.themeService.isDarkMode;
  }

  // Static logo path - navbar stays consistent across all themes
  protected get logoPath() {
    return 'New Logo.png';
  }

  // Get user display information
  protected get userDisplayName() {
    return this.authService.userDisplayName;
  }

  protected get userInitials() {
    return this.authService.userInitials;
  }

  constructor(
    public authService: AuthService,
    private router: Router,
    private themeService: ThemeService
  ) {
    this.router.events.subscribe(() => {
      // Close any open menus or reset states on route change if needed

    });
  }
  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
  onSearch() {
    console.log('Searching for:', this.searchQuery());
    // Implement search functionality here
  }
}
