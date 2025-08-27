import { Component } from '@angular/core';
import { SearchService } from '../services/search-service';
import { ProductService } from '../services/product-service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-searched-items',
  imports: [],
  templateUrl: './searched-items.html',
  styleUrl: './searched-items.css'
})
export class SearchedItems {
  featuredProducts: any;
  currProducts!: any[];

  constructor(private productService: ProductService, private route: ActivatedRoute, private searchService: SearchService) {
    this.featuredProducts = this.productService.getFeaturedProducts()();
    this.route.queryParams.subscribe(params => {
      const category = params['category'];
      if (category) {
        this.currProducts = this.featuredProducts.filter((product: any) => product.category === category);
      } else {
        this.currProducts = this.featuredProducts;
      }
    });
    let newArr = [];
    for (let product of this.currProducts) {
      if (product.name.toLowerCase().includes(this.searchService.getSearchTerm().toLowerCase())) {
        newArr.push(product);
      }
    }
    this.currProducts = newArr;
  }

  addToCart(productId: number) {
    console.log('Added product to cart:', productId);
    // Implement add to cart functionality here
  }
  
}
