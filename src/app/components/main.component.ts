import { Component, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
    selector: 'app-main',
    standalone: true,
    imports: [FormsModule, CommonModule],
    template: `
    <div class="app-container" [attr.data-theme]="isDarkMode() ? 'dark' : null">
      <!-- Navigation Bar -->
      <nav class="navbar">
        <div class="nav-container">
          <!-- Logo -->
          <div class="nav-logo">
            <img src="New Logo.png" alt="{{ title() }}" class="logo-image">
          </div>
          
          <!-- Search Bar -->
          <div class="search-container">
            <input 
              type="text" 
              [(ngModel)]="searchQuery" 
              placeholder="Search products..."
              class="search-input"
              (keyup.enter)="onSearch()"
            >
            <button class="search-btn" (click)="onSearch()">
              <i class="search-icon">🔍</i>
            </button>
          </div>
          
          <!-- Navigation Links -->
          <div class="nav-links">
            <span class="welcome-text">Welcome, {{ authService.user() }}!</span>
            <a href="#" class="nav-link">Home</a>
            <a href="#" class="nav-link">Categories</a>
            <a href="#" class="nav-link">Deals</a>
            <a href="#" class="nav-link">Contact</a>
            <button class="cart-btn">🛒 Cart</button>
            <button class="logout-btn" (click)="onLogout()">Logout</button>
          </div>
        </div>
      </nav>

      <!-- Hero Section -->
      <section class="hero">
        <div class="hero-content">
          <h1 class="hero-title">Welcome to {{ title() }}</h1>
          <p class="hero-subtitle">Discover amazing products at unbeatable prices</p>
          <button class="cta-button">Shop Now</button>
        </div>
      </section>

      <!-- Categories Section -->
      <section class="categories">
        <div class="container">
          <h2 class="section-title">Shop by Category</h2>
          <div class="categories-grid">
            @for (category of categories(); track category) {
              <div class="category-card">
                <div class="category-icon">📦</div>
                <h3>{{ category }}</h3>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- Featured Products Section -->
      <section class="featured-products">
        <div class="container">
          <h2 class="section-title">Featured Products</h2>
          <div class="products-grid">
            @for (product of featuredProducts(); track product.id) {
              <div class="product-card">
                <img [src]="product.image" [alt]="product.name" class="product-image">
                <div class="product-info">
                  <h3 class="product-name">{{ product.name }}</h3>
                  <div class="product-rating">
                    <span class="stars">⭐⭐⭐⭐⭐</span>
                    <span class="rating-text">({{ product.rating }})</span>
                  </div>
                  <div class="product-price">\${{ product.price }}</div>
                  <button class="add-to-cart-btn" (click)="addToCart(product.id)">
                    Add to Cart
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="footer">
        <div class="container">
          <div class="footer-content">
            <div class="footer-section">
              <h3>{{ title() }}</h3>
              <p>Your trusted online shopping destination</p>
            </div>
            <div class="footer-section">
              <h4>Quick Links</h4>
              <ul>
                <li><a href="#">About Us</a></li>
                <li><a href="#">Customer Service</a></li>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
              </ul>
            </div>
            <div class="footer-section">
              <h4>Contact Info</h4>
              <p>Email: info@shopmart.com</p>
              <p>Phone: (555) 123-4567</p>
            </div>
          </div>
          <div class="footer-bottom">
            <div class="footer-bottom-content">
              <p>&copy; 2025 {{ title() }}. All rights reserved.</p>
              <button class="theme-toggle" (click)="toggleTheme()" type="button">
                <span class="theme-icon">{{ isDarkMode() ? '☀️' : '🌙' }}</span>
                <span class="theme-text">{{ isDarkMode() ? 'Light Mode' : 'Dark Mode' }}</span>
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  `,
    styleUrl: '../app.css'
})
export class MainComponent implements OnInit {
    protected readonly title = signal('ShopMart');
    protected searchQuery = signal('');
    protected isDarkMode = signal(false);
    protected categories = signal([
        'Electronics',
        'Clothing',
        'Home & Garden',
        'Sports',
        'Books',
        'Beauty'
    ]);

    protected featuredProducts = signal([
        {
            id: 1,
            name: 'Wireless Headphones',
            price: 99.99,
            image: 'https://via.placeholder.com/300x300/4f46e5/ffffff?text=Headphones',
            rating: 4.5
        },
        {
            id: 2,
            name: 'Smart Watch',
            price: 199.99,
            image: 'https://via.placeholder.com/300x300/059669/ffffff?text=Smart+Watch',
            rating: 4.8
        },
        {
            id: 3,
            name: 'Laptop Stand',
            price: 39.99,
            image: 'https://via.placeholder.com/300x300/dc2626/ffffff?text=Laptop+Stand',
            rating: 4.3
        },
        {
            id: 4,
            name: 'Coffee Maker',
            price: 129.99,
            image: 'https://via.placeholder.com/300x300/7c3aed/ffffff?text=Coffee+Maker',
            rating: 4.6
        }
    ]);

    constructor(
        public authService: AuthService,
        private router: Router
    ) { }

    ngOnInit(): void {
        // Check for existing auth status
        this.authService.checkAuthStatus();

        // Check for dark mode preference
        this.checkDarkMode();
    }

    onSearch() {
        console.log('Searching for:', this.searchQuery());
        // Implement search functionality here
    }

    addToCart(productId: number) {
        console.log('Added product to cart:', productId);
        // Implement add to cart functionality here
    }

    toggleTheme() {
        this.isDarkMode.set(!this.isDarkMode());

        // Apply theme to document root
        if (this.isDarkMode()) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('darkMode', 'true');
        } else {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('darkMode', 'false');
        }
    }

    onLogout(): void {
        this.authService.logout();
        this.router.navigate(['/login']);
    }

    private checkDarkMode(): void {
        const darkMode = localStorage.getItem('darkMode');
        if (darkMode === 'true') {
            this.isDarkMode.set(true);
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    }
}
