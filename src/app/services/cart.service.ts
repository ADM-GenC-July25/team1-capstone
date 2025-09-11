import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { ProductService, Product } from './product.service';

export interface CartItem {
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
    userId: number;
    productId: number;
    quantity: number;
    // Optional fields that may be populated by backend
    productName?: string;
    productPrice?: number;
    productImage?: string;
}

// Alternative interface for the nested product structure (if backend gets updated)
interface BackendCartItemWithProduct {
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
    private baseApiUrl = 'http://978323-api-gateway.eba-ykmz27pv.us-west-2.elasticbeanstalk.com/api/cart';
    private _isCartOpen = signal(false);

    // Cart items signal - will be populated from backend
    private _cartItems = signal<CartItem[]>([]);
    private _isLoading = signal(false);
    private _error = signal<string>('');

    constructor(private http: HttpClient, private productService: ProductService) {
        this.loadCartFromBackend();
    }
    private getUserIdFromToken(): number | null {
        const token = localStorage.getItem('authToken');
        if (!token) {
            return null;
        }

        try {
            // JWT tokens have 3 parts separated by dots: header.payload.signature
            const payload = token.split('.')[1];

            // Decode base64 payload
            const decodedPayload = atob(payload);
            const parsedPayload = JSON.parse(decodedPayload);

            // Extract user ID (common claims: 'sub', 'userId', 'id', 'user_id')
            return parsedPayload.userId || null;
        } catch (error) {
            console.error('Error decoding JWT token:', error);
            return null;
        }
    }

    private getApiUrl(): string {
        const currentUser = this.getUserIdFromToken()
        const url = `${this.baseApiUrl}/user/${currentUser}`;
        return url;

    }

    private getAuthHeaders(): HttpHeaders {
        // Check both session storage and local storage for the token
        const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
        console.log('DEBUG: Auth token found:', token ? 'Yes' : 'No');
        console.log('DEBUG: Current user:', sessionStorage.getItem('currentUser') || localStorage.getItem('currentUser'));
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

    private convertBackendToCartItem(backendItem: BackendCartItem, product?: Product): CartItem {
        return {
            id: backendItem.cartId,
            productId: backendItem.productId,
            name: backendItem.productName || product?.productName || `Product ${backendItem.productId}`,
            price: backendItem.productPrice || product?.price || 0,
            image: backendItem.productImage || product?.imageLink || 'https://via.placeholder.com/300x300?text=No+Image',
            quantity: backendItem.quantity,
            rating: 4.5, // Default rating since backend doesn't have this
            inventory: product?.inventory || 0
        };
    }

    private enrichCartItemsWithProductData(backendItems: BackendCartItem[]): Observable<CartItem[]> {
        // Check if any items need product data (missing name, price, or image)
        const itemsNeedingProductData = backendItems.filter(item =>
            !item.productName || !item.productPrice || !item.productImage
        );

        if (itemsNeedingProductData.length === 0) {
            // All items have complete data, convert directly
            console.log('DEBUG: All cart items have complete product data');
            return of(backendItems.map(item => this.convertBackendToCartItem(item)));
        }

        console.log('DEBUG: Cart items need product data enrichment:', itemsNeedingProductData.length, 'items');

        // First try to get products from the ProductService cache
        const allProducts = this.productService.getAllProducts();

        if (allProducts && allProducts.length > 0) {
            console.log('DEBUG: Using cached products from ProductService');
            const cartItems = backendItems.map(backendItem => {
                const product = allProducts.find(p => p.productId === backendItem.productId);
                if (!product) {
                    console.warn('DEBUG: Product not found in cache for productId:', backendItem.productId);
                }
                return this.convertBackendToCartItem(backendItem, product);
            });
            return of(cartItems);
        }

        // If no cached products, refresh the product service and try again
        console.log('DEBUG: No cached products, refreshing ProductService');
        this.productService.refreshProducts();

        // Use a small delay to allow products to load, then try again
        return new Observable(observer => {
            setTimeout(() => {
                const refreshedProducts = this.productService.getAllProducts();
                const cartItems = backendItems.map(backendItem => {
                    const product = refreshedProducts.find(p => p.productId === backendItem.productId);
                    if (!product) {
                        console.warn('DEBUG: Product still not found after refresh for productId:', backendItem.productId);
                    }
                    return this.convertBackendToCartItem(backendItem, product);
                });
                observer.next(cartItems);
                observer.complete();
            }, 1000); // 1 second delay to allow products to load
        });
    }

    private loadCartFromBackend(): void {
        this._isLoading.set(true);
        this._error.set('');

        const apiUrl = this.getApiUrl();
        console.log('DEBUG: Loading cart from URL:', apiUrl);

        this.http.get<BackendCartItem[]>(apiUrl, {
            headers: this.getAuthHeaders()
        }).pipe(
            switchMap(backendItems => this.enrichCartItemsWithProductData(backendItems)),
            catchError(this.handleError.bind(this))
        ).subscribe({
            next: (cartItems) => {
                console.log('DEBUG: Enriched cart items loaded:', cartItems);
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

    /**
     * Get current cart items as an Observable for order processing
     */
    getCartItems(): Observable<CartItem[]> {
        const currentItems = this._cartItems();
        return of(currentItems);
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
        // Validate inputs
        if (!productId || productId <= 0) {
            return throwError(() => new Error('Invalid product ID'));
        }
        if (!quantity || quantity <= 0) {
            return throwError(() => new Error('Invalid quantity'));
        }

        const requestBody = {
            productId: Number(productId), // Ensure it's a proper number
            quantity: Number(quantity)    // Ensure it's a proper number
        };

        console.log('DEBUG: Adding item to cart:', requestBody);
        const apiUrl = this.getApiUrl();
        console.log('DEBUG: API URL:', apiUrl);

        // Check if we have a valid user
        const currentUser = sessionStorage.getItem('currentUser') || localStorage.getItem('currentUser');
        if (!currentUser) {
            return throwError(() => new Error('User not logged in'));
        }

        return this.http.post<any>(`${apiUrl}/items`, requestBody, {
            headers: this.getAuthHeaders()
        }).pipe(
            map(response => {
                console.log('DEBUG: Add item response:', response);
                // Automatically refresh cart after successful add (with enrichment)
                setTimeout(() => this.refreshCart(), 500); // Small delay to ensure backend is updated
                return response;
            }),
            catchError((error) => {
                console.error('DEBUG: Add item error:', error);
                if (error.status === 400) {
                    console.error('DEBUG: Bad request - check productId and quantity values');
                    console.error('DEBUG: Request body was:', requestBody);
                }
                return this.handleError(error);
            })
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
        const apiUrl = this.getApiUrl();

        this.http.put<any>(`${apiUrl}/items/${cartId}`, requestBody, {
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
        const apiUrl = this.getApiUrl();

        this.http.delete(`${apiUrl}/items/${cartId}`, {
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
        const apiUrl = this.getApiUrl();

        this.http.delete(apiUrl, {
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
        const apiUrl = this.getApiUrl();

        return this.http.get<{ total: number }>(`${apiUrl}/total`, {
            headers: this.getAuthHeaders()
        }).pipe(
            catchError(this.handleError.bind(this))
        );
    }
}