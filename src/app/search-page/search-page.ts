import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SearchService } from '../services/search-service';
import { ThemeService } from '../services/theme.service';

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
  
  constructor(private searchService: SearchService, private themeService: ThemeService) {
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
  protected get isDarkMode() {
    return this.themeService.isDarkMode;
  }
  ngOnInit() {
    this.currProducts = this.featuredProducts;
  }
  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}

