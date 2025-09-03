import { Injectable, signal } from '@angular/core';

interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  rating: number;
  inventory: number;
}

@Injectable({
    providedIn: 'root'
})
export class CartService {
    private _isCartOpen = signal(false);
    
    // Cart items signal
    private _cartItems = signal<CartItem[]>([
        {
            id: 1,
            name: 'Wireless Headphones',
            price: 99.99,
            image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop',
            quantity: 2,
            rating: 4.5,
            inventory: 15
        },
        {
            id: 2,
            name: 'Smart Watch',
            price: 199.99,
            image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop',
            quantity: 1,
            rating: 4.8,
            inventory: 8
        },
        {
            id: 3,
            name: 'Coffee Maker',
            price: 129.99,
            image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=300&fit=crop',
            quantity: 1,
            rating: 4.6,
            inventory: 12
        }
    ]);

    // Readonly signals that components can subscribe to
    get isCartOpen() {
        return this._isCartOpen.asReadonly();
    }

    get cartItems() {
        return this._cartItems.asReadonly();
    }

    get itemCount(): number {
        return this._cartItems().reduce((sum, item) => sum + item.quantity, 0);
    }

    get subtotal(): number {
        return this._cartItems().reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    openCart() {
        this._isCartOpen.set(true);
        document.body.style.overflow = 'hidden';
    }

    closeCart() {
        this._isCartOpen.set(false);
        document.body.style.overflow = 'auto';
    }

    toggleCart() {
        if (this._isCartOpen()) {
            this.closeCart();
        } else {
            this.openCart();
        }
    }

    addItem(item: CartItem) {
        const existingItem = this._cartItems().find(cartItem => cartItem.id === item.id);
        
        if (existingItem) {
            this.updateQuantity(item.id, existingItem.quantity + 1);
        } else {
            this._cartItems.update(items => [...items, { ...item, quantity: 1 }]);
        }
    }

    updateQuantity(itemId: number, newQuantity: number) {
        if (newQuantity < 1) {
            this.removeItem(itemId);
            return;
        }
        
        this._cartItems.update(items => 
            items.map(item => 
                item.id === itemId ? { ...item, quantity: newQuantity } : item
            )
        );
    }

    removeItem(itemId: number) {
        this._cartItems.update(items => items.filter(item => item.id !== itemId));
    }

    clearCart() {
        this._cartItems.set([]);
    }
}