import { Component, Input } from '@angular/core';

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
}

