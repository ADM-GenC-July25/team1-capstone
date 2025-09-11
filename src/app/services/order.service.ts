import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { CartService, CartItem } from './cart.service';

export interface CheckoutItem {
    productId: number;
    quantity: number;
    price: number;
}

export interface OrderRequest {
    userId: number;
    items: CheckoutItem[];
}

export interface OrderResponse {
    transactionId: number;
    user: any; // User object from backend
    price: number; // This is the total amount
    transactionDate: string; // ISO date string
}

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    private apiUrl = 'http://978323-api-gateway.eba-ykmz27pv.us-west-2.elasticbeanstalk.com';

    constructor(private http: HttpClient, private cartService: CartService) { }

    /**
     * Get user ID from JWT token
     */
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

    /**
     * Convert cart items to checkout items format
     */
    private convertCartItemsToCheckoutItems(cartItems: CartItem[]): CheckoutItem[] {
        return cartItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
        }));
    }

    /**
     * Get authentication headers with JWT token
     */
    private getAuthHeaders(): HttpHeaders {
        const token = localStorage.getItem('authToken');
        if (!token) {
            throw new Error('No authentication token found. Please log in and try again.');
        }
        return new HttpHeaders({
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        });
    }

    /**
     * Places an order by calling the backend checkout endpoint
     * First fetches cart items, then sends them to the checkout endpoint
     */
    placeOrder(): Observable<OrderResponse> {
        const userId = this.getUserIdFromToken();
        if (!userId) {
            return throwError(() => new Error('No authentication token found. Please log in and try again.'));
        }

        console.log('Starting order placement for user:', userId);

        // First, get cart items from the cart service
        return this.cartService.getCartItems().pipe(
            map(cartItems => {
                console.log('Cart items retrieved:', cartItems);

                if (!cartItems || cartItems.length === 0) {
                    throw new Error('Your cart is empty. Please add items before placing an order.');
                }

                // Convert cart items to checkout format
                const checkoutItems = this.convertCartItemsToCheckoutItems(cartItems);
                console.log('Checkout items prepared:', checkoutItems);

                return {
                    userId: userId,
                    items: checkoutItems
                } as OrderRequest;
            }),
            switchMap(orderRequest => {
                console.log('Sending checkout request:', orderRequest);
                const headers = this.getAuthHeaders();

                return this.http.post<OrderResponse>(`${this.apiUrl}/api/transactions/checkout`, orderRequest, { headers });
            }),
            catchError(this.handleError)
        );
    }

    /**
     * Handle HTTP errors with appropriate error messages
     */
    private handleError(error: HttpErrorResponse) {
        let errorMessage = 'An error occurred while placing your order. Please try again.';

        console.error('Order placement error details:', error);

        if (error.error instanceof ErrorEvent) {
            // Client-side error
            errorMessage = `Network error: ${error.error.message}`;
        } else {
            // Server-side error
            switch (error.status) {
                case 400:
                    // Check if it's an inventory issue or other validation error
                    if (error.error?.message) {
                        errorMessage = error.error.message;
                    } else if (error.error && typeof error.error === 'string') {
                        errorMessage = error.error;
                    } else {
                        errorMessage = 'Invalid order data. Please check your cart and try again.';
                    }
                    break;
                case 401:
                    errorMessage = 'You need to be logged in to place an order. Please log in and try again.';
                    break;
                case 403:
                    errorMessage = 'You do not have permission to place this order.';
                    break;
                case 404:
                    errorMessage = 'Order service not found. Please try again later.';
                    break;
                case 409:
                    errorMessage = error.error?.message || 'Some items in your cart are out of stock.';
                    break;
                case 500:
                    errorMessage = 'Server error. Please try again later.';
                    break;
                default:
                    errorMessage = error.error?.message || `Unexpected error (${error.status}). Please try again.`;
            }
        }

        console.error('Final error message:', errorMessage);
        return throwError(() => new Error(errorMessage));
    }
}
