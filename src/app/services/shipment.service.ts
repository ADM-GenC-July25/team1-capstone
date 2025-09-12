import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface ShipmentItem {
    productId: number;
    productName: string;
    quantity: number;
    priceAtPurchase: number;
    daysToDeliver: number;
}

export interface ShipmentTracking {
    transactionId: number;
    userId: number;
    price: number;
    transactionDate: string;
    // Optional fields that might come from backend later or be calculated
    trackingNumber?: string;
    status?: string;
    estimatedDelivery?: string;
    deliveryAddress?: string;
    items?: ShipmentItem[];
    maxDeliveryDays?: number;
}

@Injectable({
    providedIn: 'root'
})
export class ShipmentService {
    private baseApiUrl = 'http://978323-api-gateway.eba-ykmz27pv.us-west-2.elasticbeanstalk.com/api/transactions';

    constructor(private http: HttpClient) { }

    private getAuthHeaders(): HttpHeaders {
        const token = localStorage.getItem('authToken');
        return new HttpHeaders({
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        });
    }

    /**
     * Decode JWT token to extract user ID
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
     * Get the API URL for user-specific transactions
     */
    private getUserTransactionsUrl(): string {
        const userId = this.getUserIdFromToken();
        if (!userId) {
            throw new Error('User ID not found in token');
        }
        return `${this.baseApiUrl}/user/${userId}`;
    }

    /**
     * Get all shipments for the authenticated user
     */
    getUserShipments(): Observable<ShipmentTracking[]> {
        return this.http.get<ShipmentTracking[]>(this.getUserTransactionsUrl(), {
            headers: this.getAuthHeaders()
        }).pipe(
            catchError(this.handleError)
        );
    }

    /**
     * Get shipment details by transaction ID
     */
    getShipmentDetails(transactionId: number): Observable<ShipmentTracking> {
        return this.http.get<ShipmentTracking>(`${this.getUserTransactionsUrl()}/${transactionId}`, {
            headers: this.getAuthHeaders()
        }).pipe(
            catchError(this.handleError)
        );
    }

    /**
     * Get transaction details with items for delivery calculation
     */
    getTransactionDetails(transactionId: number): Observable<any> {
        return this.http.get<any>(`${this.baseApiUrl}/${transactionId}`, {
            headers: this.getAuthHeaders()
        }).pipe(
            catchError(this.handleError)
        );
    }

    /**
     * Cancel shipment by transaction ID
     */
    cancelShipmentById(transactionId: number): Observable<string> {
        return this.http.delete<string>(`${this.baseApiUrl}/admin/${transactionId}`, {
            headers: this.getAuthHeaders(),
            responseType: 'text' as 'json'  // Tell Angular to expect text, not JSON
        }).pipe(
            catchError(this.handleError)
        );
    }

    private handleError(error: any): Observable<never> {
        console.error('Shipment service error:', error);
        let errorMessage = 'An unknown error occurred';

        if (error.error instanceof ErrorEvent) {
            // Client-side error
            errorMessage = `Error: ${error.error.message}`;
        } else {
            // Server-side error
            errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
        }

        return throwError(() => new Error(errorMessage));
    }
}
