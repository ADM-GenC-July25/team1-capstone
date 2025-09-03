import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchService } from '../services/search-service';
import { ProductService } from '../services/product-service';
import { ActivatedRoute } from '@angular/router';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-searched-items',
  imports: [CommonModule],
  templateUrl: './searched-items.html',
  styleUrl: './searched-items.css'
})
export class SearchedItems implements OnInit {
  featuredProducts: any[] = [];
  currProducts: any[] = [];

  constructor(private productService: ProductService, private route: ActivatedRoute, private searchService: SearchService, private cartService: CartService) { }

  ngOnInit() {
    this.productService.getFeaturedProducts().subscribe(products => {
      this.featuredProducts = products;

      this.route.queryParams.subscribe(params => {
        const category = params['category'];
        if (category) {
          this.currProducts = this.featuredProducts.filter(product => product.category === category);
        } else {
          this.currProducts = this.featuredProducts;
        }
      });

      let newArr = [];
      for (let product of this.currProducts) {
        if (product.productName.toLowerCase().includes(this.searchService.getSearchTerm().toLowerCase())) {
          newArr.push(product);
        }
      }
      this.currProducts = newArr;
    });
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
}