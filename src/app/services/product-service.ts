import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  protected featuredProducts = signal([
        {
            id: 1,
            name: 'Wireless Headphones',
            price: 99.99,
            image: 'https://via.placeholder.com/300x300/4f46e5/ffffff?text=Headphones',
            rating: 4.5,
            category: 'Electronics'
        },
        {
            id: 2,
            name: 'Smart Watch',
            price: 199.99,
            image: 'https://via.placeholder.com/300x300/059669/ffffff?text=Smart+Watch',
            rating: 4.8,
            category: 'Electronics'
        },
        {
            id: 3,
            name: 'Laptop Stand',
            price: 39.99,
            image: 'https://via.placeholder.com/300x300/dc2626/ffffff?text=Laptop+Stand',
            rating: 4.3,
            category: 'Electronics'
        },
        {
            id: 4,
            name: 'Coffee Maker',
            price: 129.99,
            image: 'https://via.placeholder.com/300x300/7c3aed/ffffff?text=Coffee+Maker',
            rating: 4.6,
            category: 'Home & Garden'
        },
        {
            id: 1,
            name: 'Toaster',
            price: 99.99,
            image: 'https://via.placeholder.com/300x300/4f46e5/ffffff?text=Toaster',
            rating: 4.5,
            category: 'Home & Garden'
        },
        {
            id: 2,
            name: 'Wireless Charger',
            price: 199.99,
            image: 'https://via.placeholder.com/300x300/059669/ffffff?text=Wireless+Charger',
            rating: 4.8,
            category: 'Electronics'
        },
        {
            id: 3,
            name: 'Laptop',
            price: 600.00,
            image: 'https://via.placeholder.com/300x300/dc2626/ffffff?text=Laptop',
            rating: 4.3,
            category: 'Electronics'
        },
        {
            id: 4,
            name: 'Smart Thermostat',
            price: 129.99,
            image: 'https://via.placeholder.com/300x300/7c3aed/ffffff?text=Smart+Thermostat',
            rating: 4.6,
            category: 'Home & Garden'
        }
    ]);
    getFeaturedProducts() {
        return this.featuredProducts.asReadonly();
    }
}
