import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { AuthService } from './services/auth.service';
import { ThemeService } from './services/theme.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navbar } from './navbar/navbar';
import { Footer } from './footer/footer';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, FormsModule, Navbar, Footer],
  templateUrl: './app.html',
  styleUrls: ['../styles.css', './app.css']
})
export class App implements OnInit {
  authorized: boolean = false;
  protected searchQuery = signal('');

  // Use shared theme service
  protected get isDarkMode() {
    return this.themeService.isDarkMode;
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  constructor(
    public authService: AuthService,
    private router: Router,
    private themeService: ThemeService
  ) { }

  ngOnInit(): void {
    // Initialize auth status on app start
    this.authService.checkAuthStatus();
    this.authorized = this.authService.isAuthenticated();
    console.log(this.authorized);

    // Theme service automatically initializes dark mode preference

    // Listen for route changes to update authorization status
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.authorized = this.authService.isAuthenticated();
        console.log('Route changed, auth status:', this.authorized);
      });
  }

  ngOnChanges(): void {
    // React to any changes if necessary
    this.authService.checkAuthStatus();
    this.authorized = this.authService.isAuthenticated();
  }

  onSearch() {
    console.log('Searching for:', this.searchQuery());
    // Implement search functionality here
  }

  onLogout(): void {
    this.authService.logout();

    // Clear browser history and navigate to login
    this.router.navigate(['/login'], { replaceUrl: true });

    // Additional security: clear any cached data
    sessionStorage.clear();

    // Update local state immediately
    this.authorized = false;
  }
}
