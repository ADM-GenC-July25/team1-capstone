import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ThemeService } from '../services/theme.service';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.html',
  styleUrls: ['../app.css', './cart.css']
})
export class CartComponent {
  protected readonly title = signal('ByteBazaar');

  constructor(
    private themeService: ThemeService,
    private cartService: CartService,
    private router: Router
  ) { }

  protected get isDarkMode() {
    return this.themeService.isDarkMode;
  }

  get cartItems() {
    return this.cartService.cartItems();
  }

  get isLoading() {
    return this.cartService.isLoading();
  }

  get error() {
    return this.cartService.error();
  }

  get subtotal(): number {
    return this.cartService.subtotal;
  }

  get tax(): number {
    return this.subtotal * 0.08; // 8% tax
  }

  get total(): number {
    return this.subtotal + this.tax;
  }

  onCartClick() {
    this.cartService.toggleCart();
  }

  updateQuantity(itemId: number, newQuantity: number): void {
    this.cartService.updateQuantity(itemId, newQuantity);
  }

  removeItem(itemId: number): void {
    this.cartService.removeItem(itemId);
  }

  refreshCart(): void {
    this.cartService.refreshCart();
  }

  checkout(): void {
    if (this.cartItems.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    // Close cart modal and navigate to checkout
    this.cartService.closeCart();
    this.router.navigate(['/checkout']);
  }
}