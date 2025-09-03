import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchService } from '../services/search-service';

import { ProductService, Product } from '../services/product.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CartService } from '../services/cart.service';
import { CategoryService, Category } from '../services/category.service';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-searched-items',
  imports: [CommonModule, RouterLink],

  templateUrl: './searched-items.html',
  styleUrl: './searched-items.css'
})
export class SearchedItems implements OnInit {
  featuredProducts: Product[] = [];
  currProducts: Product[] = [];
  categories: Category[] = [];
  isLoading = false;
  error = '';

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private searchService: SearchService,
    private cartService: CartService,
    private categoryService: CategoryService,
    private themeService: ThemeService
  ) { }

  ngOnInit() {
    this.isLoading = true;
    this.error = '';

    // Load categories first
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.error = 'Failed to load categories';
      }
    });

    // Subscribe to products from the ProductService
    this.productService.products$.subscribe({
      next: (products) => {
        this.featuredProducts = products;
        this.processRouteParams();
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.error = 'Failed to load products';
        this.isLoading = false;
      }
    });

    // Subscribe to route parameters for category filtering
    this.route.queryParams.subscribe(params => {
      this.processRouteParams();
    });
  }

  private processRouteParams() {
    const params = this.route.snapshot.queryParams;
    const category = params['category'];
    const searchTerm = this.searchService.getSearchTerm();

    if (category) {
      // Filter by category using backend API
      this.productService.getProductsByCategoryName(category).subscribe({
        next: (products) => {
          this.currProducts = products;
          this.applySearchFilter(searchTerm);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading products by category:', error);
          this.error = 'Failed to load products for this category';
          this.isLoading = false;
        }
      });
    } else {
      // Use all products if no category specified
      this.currProducts = [...this.featuredProducts];
      this.applySearchFilter(searchTerm);
      this.isLoading = false;
    }
  }

  private applySearchFilter(searchTerm: string) {
    if (searchTerm && searchTerm.trim() !== '') {
      this.currProducts = this.currProducts.filter(product =>
        product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
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

  isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }
}