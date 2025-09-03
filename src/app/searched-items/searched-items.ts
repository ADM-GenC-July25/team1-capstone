import { Component, OnInit } from '@angular/core';
import { SearchService } from '../services/search-service';
import { ProductService } from '../services/product-service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-searched-items',
  imports: [CommonModule, RouterLink],
  templateUrl: './searched-items.html',
  styleUrl: './searched-items.css'
})
export class SearchedItems implements OnInit {
  featuredProducts: any[] = [];
  currProducts: any[] = [];

  constructor(private productService: ProductService, private route: ActivatedRoute, private searchService: SearchService) {}

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
    console.log('Added product to cart:', productId);
  }

  isDarkMode(): boolean {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  }
}