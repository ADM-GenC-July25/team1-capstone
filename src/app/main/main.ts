import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../services/theme.service';
import { WelcomePage } from '../welcome-page/welcome-page';
import { SearchPage } from '../search-page/search-page';

@Component({
    selector: 'app-main',
    standalone: true,
    imports: [CommonModule, WelcomePage, SearchPage],
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
        },
        {
            id: 1,
            name: 'Toaster',
            price: 99.99,
            image: 'https://via.placeholder.com/300x300/4f46e5/ffffff?text=Toaster',
            rating: 4.5
        },
        {
            id: 2,
            name: 'Wireless Charger',
            price: 199.99,
            image: 'https://via.placeholder.com/300x300/059669/ffffff?text=Wireless+Charger',
            rating: 4.8
        },
        {
            id: 3,
            name: 'Laptop',
            price: 600.00,
            image: 'https://via.placeholder.com/300x300/dc2626/ffffff?text=Laptop',
            rating: 4.3
        },
        {
            id: 4,
            name: 'Smart Thermostat',
            price: 129.99,
            image: 'https://via.placeholder.com/300x300/7c3aed/ffffff?text=Smart+Thermostat',
            rating: 4.6
        }
    ]);

    constructor(private themeService: ThemeService) {

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
