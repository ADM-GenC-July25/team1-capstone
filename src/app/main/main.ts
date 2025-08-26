import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../services/theme.service';
import { WelcomePage } from '../welcome-page/welcome-page';
import { SearchPage } from '../search-page/search-page';
import { CartComponent } from '../cart/cart';
import { CartService } from '../services/cart.service';
import { RouterLink } from '@angular/router';
import { ProductService } from '../services/product.service';

@Component({
    selector: 'app-main',
    standalone: true,
    imports: [CommonModule, WelcomePage, SearchPage, CartComponent, RouterLink],
    templateUrl: 'main.html',
    styleUrls: ['../app.css', './main.css', './theme-toggle.css']
})
export class MainComponent implements OnInit {
    protected readonly title = signal('ByteBazaar');

    // Use the shared theme service instead of local state
    protected get isDarkMode() {
        return this.themeService.isDarkMode;
    }

    protected categories = signal([
        'Electronics',
        'Clothing',
        'Home & Garden',
        'Sports',
        'Books',
        'Beauty'
    ]);

    protected featuredProducts = signal<any[]>([]);

    constructor(private themeService: ThemeService, private cartService: CartService, private productService: ProductService) {
        // Initialize featured products from the service
        this.featuredProducts.set(this.productService.getAllProducts());
    }
    get isCartOpen() {
  return this.cartService.isCartOpen;
}

closeCart() {
  this.cartService.closeCart();
}

    ngOnInit(): void {
        // Component initialization if needed
    }

    addToCart(productId: number) {
        console.log('Added product to cart:', productId);
        // Implement add to cart functionality here
    }

    toggleTheme() {
        this.themeService.toggleTheme();
    }
}
