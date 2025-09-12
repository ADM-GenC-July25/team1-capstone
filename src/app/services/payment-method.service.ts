import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface PaymentMethod {
  paymentId: number;
  cardNumber: string;
  cardExpirationMonth: number;
  cardExpirationYear: number;
  nameOnCard: string;
  // Billing address fields - these match the backend PaymentMethod model
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

interface PaymentMethodRequest {
  cardNumber: string;
  cardExpirationMonth: number;
  cardExpirationYear: number;
  nameOnCard: string;
  // Billing address fields (optional but recommended for complete payment method)
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentMethodService {
  private apiUrl = 'http://978323-api-gateway.eba-ykmz27pv.us-west-2.elasticbeanstalk.com/api/payment-methods';

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
   * Handle HTTP errors with appropriate error messages
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred with the payment method operation.';

    console.error('Payment method service error:', error);

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Network error: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 400:
          errorMessage = error.error?.message || 'Invalid payment method data. Please check your information.';
          break;
        case 401:
          errorMessage = 'You need to be logged in to manage payment methods. Please log in and try again.';
          break;
        case 403:
          errorMessage = 'You do not have permission to access this payment method.';
          break;
        case 404:
          errorMessage = 'Payment method not found.';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
          break;
        default:
          errorMessage = error.error?.message || `Unexpected error (${error.status}). Please try again.`;
      }
    }

    return throwError(() => new Error(errorMessage));
  }

  getUserPaymentMethods(): Observable<PaymentMethod[]> {
    try {
      const headers = this.getAuthHeaders();
      return this.http.get<PaymentMethod[]>(this.apiUrl, { headers })
        .pipe(catchError(this.handleError));
    } catch (error) {
      return throwError(() => error);
    }
  }

  addPaymentMethod(paymentMethod: PaymentMethodRequest): Observable<PaymentMethod> {
    try {
      const headers = this.getAuthHeaders();
      console.log('Adding payment method:', paymentMethod);
      return this.http.post<PaymentMethod>(this.apiUrl, paymentMethod, { headers })
        .pipe(catchError(this.handleError));
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Update a payment method
   */
  updatePaymentMethod(paymentId: number, paymentMethod: PaymentMethodRequest): Observable<PaymentMethod> {
    try {
      const headers = this.getAuthHeaders();
      return this.http.put<PaymentMethod>(`${this.apiUrl}/${paymentId}`, paymentMethod, { headers })
        .pipe(catchError(this.handleError));
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Delete a payment method
   */
  deletePaymentMethod(paymentId: number): Observable<void> {
    try {
      const headers = this.getAuthHeaders();
      return this.http.delete<void>(`${this.apiUrl}/${paymentId}`, { headers })
        .pipe(catchError(this.handleError));
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Get a specific payment method by ID
   */
  getPaymentMethodById(paymentId: number): Observable<PaymentMethod> {
    try {
      const headers = this.getAuthHeaders();
      return this.http.get<PaymentMethod>(`${this.apiUrl}/${paymentId}`, { headers })
        .pipe(catchError(this.handleError));
    } catch (error) {
      return throwError(() => error);
    }
  }
}