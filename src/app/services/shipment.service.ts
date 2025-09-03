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
    trackingNumber: string;
    status: string;
    totalPrice: number;
    orderDate: string;
    estimatedDelivery: string;
    deliveryAddress: string;
    items: ShipmentItem[];
    maxDeliveryDays: number;
}

@Injectable({
    providedIn: 'root'
})
export class ShipmentService {
    private apiUrl = 'http://978358-test-with-taryn-env.eba-ykmz27pv.us-west-2.elasticbeanstalk.com/api/shipments';

    constructor(private http: HttpClient) { }

    private getAuthHeaders(): HttpHeaders {
        const token = localStorage.getItem('authToken');
        return new HttpHeaders({
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        });
    }

    /**
     * Get all shipments for the authenticated user
     */
    getUserShipments(): Observable<ShipmentTracking[]> {
        return this.http.get<ShipmentTracking[]>(this.apiUrl, {
            headers: this.getAuthHeaders()
        }).pipe(
            catchError(this.handleError)
        );
    }

    /**
     * Get shipment details by transaction ID
     */
    getShipmentDetails(transactionId: number): Observable<ShipmentTracking> {
        return this.http.get<ShipmentTracking>(`${this.apiUrl}/${transactionId}`, {
            headers: this.getAuthHeaders()
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
