import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../services/theme.service';
import { CartService } from '../services/cart.service';

interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  rating: number;
}

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.html',
  styleUrls: ['../app.css', './cart.css']
})
export class CartComponent {
  protected readonly title = signal('ByteBazaar');
  onCartClick() {
    this.cartService.toggleCart();
  }
  protected get isDarkMode() {
    return this.themeService.isDarkMode;
  }

  protected cartItems = signal<CartItem[]>([
    {
      id: 1,
      name: 'Wireless Headphones',
      price: 99.99,
      image: 'https://via.placeholder.com/150x150/4f46e5/ffffff?text=Headphones',
      quantity: 2,
      rating: 4.5
    },
    {
      id: 2,
      name: 'Smart Watch',
      price: 199.99,
      image: 'https://via.placeholder.com/150x150/059669/ffffff?text=Smart+Watch',
      quantity: 1,
      rating: 4.8
    },
    {
      id: 3,
      name: 'Coffee Maker',
      price: 129.99,
      image: 'https://via.placeholder.com/150x150/7c3aed/ffffff?text=Coffee+Maker',
      quantity: 1,
      rating: 4.6
    }
  ]);

  constructor(private themeService: ThemeService, private cartService: CartService) {}

  get subtotal(): number {
    return this.cartItems().reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  get tax(): number {
    return this.subtotal * 0.08; // 8% tax
  }

  get total(): number {
    return this.subtotal + this.tax;
  }

  updateQuantity(itemId: number, newQuantity: number): void {
    if (newQuantity < 1) return;
    
    this.cartItems.update(items => 
      items.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  }

  removeItem(itemId: number): void {
    this.cartItems.update(items => items.filter(item => item.id !== itemId));
  }

  checkout(): void {
    console.log('Proceeding to checkout with items:', this.cartItems());
    // Implement checkout functionality here
  }
}
