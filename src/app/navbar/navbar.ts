import { Component, signal } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  imports: [FormsModule, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  protected readonly title = signal('ShopMart');
  protected searchQuery = signal('');
   constructor(
        public authService: AuthService,
        private router: Router
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
