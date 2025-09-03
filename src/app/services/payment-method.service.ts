import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface PaymentMethod {
  paymentId: number;
  cardNumber: string;
  cardExpirationMonth: number;
  cardExpirationYear: number;
  nameOnCard: string;
}

interface PaymentMethodRequest {
  cardNumber: string;
  cardExpirationMonth: number;
  cardExpirationYear: number;
  nameOnCard: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentMethodService {
  private apiUrl = 'http://978358-test-with-taryn-env.eba-ykmz27pv.us-west-2.elasticbeanstalk.com/api/payment-methods';

  constructor(private http: HttpClient) {}

  getUserPaymentMethods(): Observable<PaymentMethod[]> {
    return this.http.get<PaymentMethod[]>(this.apiUrl);
  }

  addPaymentMethod(paymentMethod: PaymentMethodRequest): Observable<PaymentMethod> {
    return this.http.post<PaymentMethod>(this.apiUrl, paymentMethod);
  }
}