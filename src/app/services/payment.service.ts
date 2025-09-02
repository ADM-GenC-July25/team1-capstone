import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface PaymentMethod {
    paymentId?: number;
    cardNumber: string;
    cardExpirationMonth: number;
    cardExpirationYear: number;
    nameOnCard: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}

export interface PaymentMethodRequest {
    cardNumber: string;
    cardExpirationMonth: number;
    cardExpirationYear: number;
    nameOnCard: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}

@Injectable({
    providedIn: 'root'
})
export class PaymentService {
    private apiUrl = 'http://978358-test-with-taryn-env.eba-ykmz27pv.us-west-2.elasticbeanstalk.com/api/payment-methods';

    constructor(private http: HttpClient) { }

    private getAuthHeaders(): HttpHeaders {
        const token = localStorage.getItem('authToken');
        return new HttpHeaders({
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        });
    }

    /**
     * Get all payment methods for the authenticated user
     */
    getUserPaymentMethods(): Observable<PaymentMethod[]> {
        return this.http.get<PaymentMethod[]>(this.apiUrl, {
            headers: this.getAuthHeaders()
        }).pipe(
            catchError(this.handleError)
        );
    }

    /**
     * Add a new payment method
     */
    addPaymentMethod(paymentMethod: PaymentMethodRequest): Observable<PaymentMethod> {
        return this.http.post<PaymentMethod>(this.apiUrl, paymentMethod, {
            headers: this.getAuthHeaders()
        }).pipe(
            catchError(this.handleError)
        );
    }

    /**
     * Update an existing payment method
     */
    updatePaymentMethod(id: number, paymentMethod: PaymentMethodRequest): Observable<PaymentMethod> {
        return this.http.put<PaymentMethod>(`${this.apiUrl}/${id}`, paymentMethod, {
            headers: this.getAuthHeaders()
        }).pipe(
            catchError(this.handleError)
        );
    }

    /**
     * Delete a payment method
     */
    deletePaymentMethod(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`, {
            headers: this.getAuthHeaders()
        }).pipe(
            catchError(this.handleError)
        );
    }

    /**
     * Get a specific payment method by ID
     */
    getPaymentMethod(id: number): Observable<PaymentMethod> {
        return this.http.get<PaymentMethod>(`${this.apiUrl}/${id}`, {
            headers: this.getAuthHeaders()
        }).pipe(
            catchError(this.handleError)
        );
    }

    private handleError(error: any): Observable<never> {
        console.error('Payment service error:', error);
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
