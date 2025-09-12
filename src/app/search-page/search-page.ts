import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { SearchService } from '../services/search-service';
import { ThemeService } from '../services/theme.service';
import { CartService } from '../services/cart.service';
import { AuthService } from '../services/auth.service';
import { ProductService } from '../services/product.service';

@Component({
  selector: 'app-search-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './search-page.html',
  styleUrl: './search-page.css'
})
export class SearchPage implements OnInit, OnDestroy {
  @Input() featuredProducts: any[] = [];
  @Input() addToCart!: (productId: any) => void;
  currProducts!: any[];
  searchTerm: string = '';
  sub: any;

  constructor(private searchService: SearchService, private themeService: ThemeService, private cartService: CartService, private authService: AuthService, private productService: ProductService, private router: Router) {
    this.sub = this.searchService.searchTerm.subscribe(term => {
      this.searchTerm = term;
      this.currProducts = [];
      for (let product of this.featuredProducts) {
        if (product.productName && product.productName.toLowerCase().includes(term.toLowerCase())) {
          this.currProducts.push(product);
        }
      }
    });
  }
  protected get isDarkMode() {
    return this.themeService.isDarkMode;
  }

  get canManageProducts() {
    const user = this.authService.user();
    const userRoles = user?.roles || [];
    return userRoles.includes('ADMIN') || userRoles.includes('EMPLOYEE') || userRoles.includes('admin') || userRoles.includes('employee');
  }
  ngOnInit() {
    this.currProducts = this.featuredProducts;
  }
  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  // Local addToCart method that uses CartService
  addToCartLocal(productId: number) {
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

  editProduct(productId: number) {
    this.router.navigate(['/edit-product', productId]);
  }

  deleteProduct(productId: number) {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(productId).subscribe({
        next: () => {
          // Remove from current products array
          this.currProducts = this.currProducts.filter(p => p.productId !== productId);
          this.featuredProducts = this.featuredProducts.filter(p => p.productId !== productId);
        },
        error: (error) => {
          console.error('Error deleting product:', error);
          alert('Failed to delete product. Please try again.');
        }
      });
    }
  }
}

