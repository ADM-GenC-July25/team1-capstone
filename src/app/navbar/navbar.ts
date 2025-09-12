import { Component, EventEmitter, Output, signal } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ThemeService } from '../services/theme.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SearchService } from '../services/search-service';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-navbar',
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  protected readonly title = signal('ByteBazaar');
  protected searchQuery = signal('');
  @Output() cartToggled = new EventEmitter<boolean>();


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

    if (this.authService.userDisplayName !== null) {
      const initials: string = this.authService.userDisplayName.toString();
      return initials[11].toUpperCase() as string;
    }
    return 'U';
  }

  protected get canManageProducts() {
    const user = this.authService.user();
    const userRoles = user?.roles || [];
    return userRoles.includes('ADMIN') || userRoles.includes('EMPLOYEE') || userRoles.includes('admin') || userRoles.includes('employee');
  }

  constructor(
    public authService: AuthService,
    private router: Router,
    private themeService: ThemeService,
    private searchService: SearchService,
    public cartService: CartService,
    private route: ActivatedRoute
  ) {
    this.router.events.subscribe(() => {
      // Close any open menus or reset states on route change if needed

    });
  }
  onCartClick() {
    this.cartService.openCart();
  }
  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
  onSearch() {
    this.searchService.updateSearchTerm(this.searchQuery());
  }

  onButtonClick() {
    let params = this.route.snapshot.queryParams;
    const currentUrl = this.router.url.split('?')[0];
    if (currentUrl === '/search') {
      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigate([currentUrl], { queryParams: params });
      });
    }
    else {
      this.router.navigate(['/search']);
    }
  }
  test() {
    console.log('test');
  }

  scrollToFooter() {
    const footer = document.querySelector('footer.footer');
    if (footer) {
      footer.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
