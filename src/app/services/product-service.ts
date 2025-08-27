import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:8080/api/products';

  constructor(private http: HttpClient) {}

  getAllProducts(): Observable<any[]> {
    console.log('Making API call to:', this.apiUrl);
    return this.http.get<any[]>(this.apiUrl);
  }

  getFeaturedProducts(): Observable<any[]> {
    return this.getAllProducts();
  }
}
