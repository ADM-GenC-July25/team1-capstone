import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

interface CartItem {
    id: number; // cartId from backend
    name: string; // product name
    price: number; // product price
    image: string; // product image
    quantity: number;
    rating: number; // product rating
    productId: number; // product ID from backend
    inventory: number; // product inventory from backend
}
interface BackendCartItem {
    cartId: number;
    user: any;
    product: {
        productId: number;
        productName: string;
        price: number;
        imageLink: string;
        description: string;
        inventory: number;
        daysToDeliver: number;
    };
    quantity: number;

}

@Injectable({
    providedIn: 'root'
})
export class CartService {
    private apiUrl = 'http://978358-test-with-taryn-env.eba-ykmz27pv.us-west-2.elasticbeanstalk.com/api/cart';
    private _isCartOpen = signal(false);

    // Cart items signal - will be populated from backend
    private _cartItems = signal<CartItem[]>([]);
    private _isLoading = signal(false);
    private _error = signal<string>('');

    constructor(private http: HttpClient) {
        this.loadCartFromBackend();
    }

    private getAuthHeaders(): HttpHeaders {
        // Check both session storage and local storage for the token
        const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
        console.log('DEBUG: Auth token found:', token ? 'Yes' : 'No');
        return new HttpHeaders({
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        });
    }

    private handleError(error: any): Observable<never> {
        console.error('Cart service error:', error);
        let errorMessage = 'An unknown error occurred';

        if (error.error instanceof ErrorEvent) {
            // Client-side error
            errorMessage = `Error: ${error.error.message}`;
        } else {
            // Server-side error
            errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
            if (error.status === 401) {
                errorMessage = 'Please log in to access your cart';
            }

        }

        this._error.set(errorMessage);
        return throwError(() => new Error(errorMessage));
    }

    private convertBackendToCartItem(backendItem: BackendCartItem): CartItem {
        return {
            id: backendItem.cartId,
            productId: backendItem.product.productId,
            name: backendItem.product.productName,
            price: backendItem.product.price,
            image: backendItem.product.imageLink || 'https://via.placeholder.com/300x300?text=No+Image',
            quantity: backendItem.quantity,
            rating: 4.5, // Default rating since backend doesn't have this
            inventory: backendItem.product.inventory || 0 // Include inventory from backend
        };
    }

    private loadCartFromBackend(): void {
        this._isLoading.set(true);
        this._error.set('');

        this.http.get<BackendCartItem[]>(this.apiUrl, {
            headers: this.getAuthHeaders()
        }).pipe(
            map(backendItems => backendItems.map(item => this.convertBackendToCartItem(item))),
            catchError(this.handleError.bind(this))
        ).subscribe({
            next: (cartItems) => {
                this._cartItems.set(cartItems);
                this._isLoading.set(false);
            },
            error: (error) => {
                this._isLoading.set(false);
                console.error('Error loading cart:', error);
            }
        });
    }

    // Readonly signals that components can subscribe to
    get isCartOpen() {
        return this._isCartOpen.asReadonly();
    }

    get cartItems() {
        return this._cartItems.asReadonly();
    }

    get isLoading() {
        return this._isLoading.asReadonly();
    }

    get error() {
        return this._error.asReadonly();
    }

    get itemCount(): number {
        return this._cartItems().reduce((sum, item) => sum + item.quantity, 0);
    }

    get subtotal(): number {
        return this._cartItems().reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    // UI Methods
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

    // Backend API Methods
    refreshCart(): void {
        this.loadCartFromBackend();
    }

    addItem(productId: number, quantity: number = 1): Observable<any> {
        const requestBody = {
            productId: productId,
            quantity: quantity
        };

        return this.http.post<any>(`${this.apiUrl}/items`, requestBody, {
            headers: this.getAuthHeaders()
        }).pipe(
            map(response => {
                // Automatically refresh cart after successful add
                this.refreshCart();
                return response;
            }),
            catchError(this.handleError.bind(this))
        );
    }

    addItemToCart(item: CartItem): void {
        // For existing items, we use the product ID to add to backend
        this.addItem(item.productId, 1).subscribe({
            next: () => {
                // addItem method already refreshes cart automatically
                console.log('Item added to cart successfully');
            },
            error: (error) => {
                console.error('Error adding item to cart:', error);
            }
        });
    }

    updateQuantity(cartId: number, newQuantity: number): void {
        if (newQuantity < 1) {
            this.removeItem(cartId);
            return;
        }

        const requestBody = { quantity: newQuantity };

        this.http.put<any>(`${this.apiUrl}/items/${cartId}`, requestBody, {
            headers: this.getAuthHeaders()
        }).pipe(
            catchError(this.handleError.bind(this))
        ).subscribe({
            next: () => {
                this.refreshCart(); // Reload cart from backend
            },
            error: (error) => {
                console.error('Error updating quantity:', error);
            }
        });
    }

    removeItem(cartId: number): void {
        this.http.delete(`${this.apiUrl}/items/${cartId}`, {
            headers: this.getAuthHeaders()
        }).pipe(
            catchError(this.handleError.bind(this))
        ).subscribe({
            next: () => {
                this.refreshCart(); // Reload cart from backend
            },
            error: (error) => {
                console.error('Error removing item:', error);
            }
        });
    }

    clearCart(): void {
        this.http.delete(this.apiUrl, {
            headers: this.getAuthHeaders()
        }).pipe(
            catchError(this.handleError.bind(this))
        ).subscribe({
            next: () => {
                this._cartItems.set([]);
            },
            error: (error) => {
                console.error('Error clearing cart:', error);
            }
        });
    }

    getCartTotal(): Observable<{ total: number }> {
        return this.http.get<{ total: number }>(`${this.apiUrl}/total`, {
            headers: this.getAuthHeaders()
        }).pipe(
            catchError(this.handleError.bind(this))
        );
    }
}