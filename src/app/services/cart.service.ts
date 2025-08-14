import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class CartService {
    private _isCartOpen = signal(false);

    // Readonly signal that components can subscribe to
    get isCartOpen() {
        return this._isCartOpen.asReadonly();
    }

    openCart() {
        this._isCartOpen.set(true);
        // Prevent background scrolling when modal is open
        document.body.style.overflow = 'hidden';
    }

    closeCart() {
        this._isCartOpen.set(false);
        // Re-enable background scrolling when modal is closed
        document.body.style.overflow = 'auto';
    }

    toggleCart() {
        if (this._isCartOpen()) {
            this.closeCart();
        } else {
            this.openCart();
        }
    }
}
