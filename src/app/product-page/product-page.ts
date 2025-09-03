import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductService, Product } from '../services/product.service';
import { ThemeService } from '../services/theme.service';
import { Subscription, combineLatest } from 'rxjs';

@Component({
  selector: 'app-product-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-page.html',
  styleUrl: './product-page.css'
})
export class ProductPage implements OnInit, OnDestroy {
  productName: string = '';
  product: Product | undefined;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private themeService: ThemeService
  ) {}

  ngOnInit() {
    // Combine route params and products observable to ensure products are loaded
    const combinedSubscription = combineLatest([
      this.route.paramMap,
      this.productService.products$
    ]).subscribe(([params, products]) => {
      const id = Number(params.get('id'));
      if (products.length > 0) {
        this.product = products.find(product => product.productId === id);
      }
    });

    this.subscriptions.add(combinedSubscription);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  protected get isDarkMode() {
    return this.themeService.isDarkMode;
  }
}
