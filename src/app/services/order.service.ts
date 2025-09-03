import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface OrderRequest {
    // The backend expects the order to be created from cart items
    // No additional data needed as cart items are already in the backend
    // But we can optionally include shipping information for completeness
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
    private apiUrl = 'http://978358-test-with-taryn-env.eba-ykmz27pv.us-west-2.elasticbeanstalk.com';

    constructor(private http: HttpClient) { }

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
     * The backend will create the order from existing cart items,
     * check inventory, update stock, and clear the cart
     */
    placeOrder(): Observable<OrderResponse> {
        const headers = this.getAuthHeaders();
        console.log('Placing order with headers:', headers);
        console.log('Making request to:', `${this.apiUrl}/api/transactions/checkout`);

        return this.http.post<OrderResponse>(`${this.apiUrl}/api/transactions/checkout`, {}, { headers })
            .pipe(
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
