import { Component, Input } from '@angular/core';
import { SearchService } from '../services/search-service';

@Component({
  selector: 'app-search-page',
  standalone: true,
  imports: [],
  templateUrl: './search-page.html',
  styleUrl: './search-page.css'
})
export class SearchPage {
  @Input() featuredProducts: any[] = [];
  @Input() addToCart!: (productId: any) => void;
  currProducts!: any[];
  searchTerm!: string;
  
  constructor(private searchService: SearchService) {
    this.searchService.searchTerm.subscribe(term => {
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
    this.searchTerm = '';
  }
}

