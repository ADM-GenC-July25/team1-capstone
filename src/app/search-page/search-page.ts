import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { SearchService } from '../services/search-service';

@Component({
  selector: 'app-search-page',
  standalone: true,
  imports: [],
  templateUrl: './search-page.html',
  styleUrl: './search-page.css'
})
export class SearchPage implements OnInit, OnDestroy {
  @Input() featuredProducts: any[] = [];
  @Input() addToCart!: (productId: any) => void;
  currProducts!: any[];
  searchTerm: string = '';
  sub: any;
  
  constructor(private searchService: SearchService) {
    this.sub = this.searchService.searchTerm.subscribe(term => {
      this.searchTerm = term;
      this.currProducts = [];
      for (let product of this.featuredProducts) {
        if (product.name.toLowerCase().includes(term.toLowerCase())) {
          this.currProducts.push(product);
        }
      }
    });
  }

  ngOnInit() {
    this.currProducts = this.featuredProducts;
  }
  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}

