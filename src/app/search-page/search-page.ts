import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SearchService } from '../services/search-service';
import { ThemeService } from '../services/theme.service';
import { CartService } from '../services/cart.service';

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

  constructor(private searchService: SearchService, private themeService: ThemeService, private cartService: CartService) {
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
}

