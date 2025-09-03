import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../services/theme.service';
import { WelcomePage } from '../welcome-page/welcome-page';
import { SearchPage } from '../search-page/search-page';
import { CartComponent } from '../cart/cart';
import { CartService } from '../services/cart.service';
import { Router } from '@angular/router';
import { ProductService } from '../services/product.service';
import { SearchService } from '../services/search-service';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-main',
    standalone: true,
    imports: [CommonModule, WelcomePage, SearchPage, CartComponent, RouterLink],
    templateUrl: 'main.html',
    styleUrls: ['../app.css', './main.css', './theme-toggle.css']
})
export class MainComponent implements OnInit {
    protected readonly title = signal('ByteBazaar');
    protected featuredProducts = signal<any[]>([]);

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

    constructor(private themeService: ThemeService, private cartService: CartService, private router: Router, private productService: ProductService, private searchService: SearchService) {
    }
    get isCartOpen() {
        return this.cartService.isCartOpen;
    }

    closeCart() {
        this.cartService.closeCart();
    }

    ngOnInit(): void {
        console.log('MainComponent ngOnInit called');
        // Use a timeout to ensure the service has loaded products
        setTimeout(() => {
            const products = this.productService.getAllProducts();
            console.log('Products received:', products);
            this.featuredProducts.set(products);
        }, 1000);
        this.searchService.updateSearchTerm('');
    }

    addToCart(productId: number) {
        console.log('Adding product to cart:', productId);

        // Add item to cart via the CartService
        this.cartService.addItem(productId, 1).subscribe({
            next: (response) => {
                console.log('Product added to cart successfully:', response);
                // Cart automatically refreshes after successful add
                // Optionally show a success message to the user
                // You could add a toast notification service here
            },
            error: (error) => {
                console.error('Error adding product to cart:', error);
                // Optionally show an error message to the user
                alert('Failed to add product to cart. Please try again.');
            }
        });
    }

    toggleTheme() {
        this.themeService.toggleTheme();
    }

    categoryClicked(category: string) {
        this.router.navigate(['/search'], { queryParams: { category } });
    }
}
