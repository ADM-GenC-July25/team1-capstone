import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface Product {
  productId: number;
  productName: string;
  inventory: number;
  price: number;
  imageLink: string;
  description: string;
  daysToDeliver: number;
}

export interface CreateProductRequest {
  productName: string;
  inventory: number;
  price: number;
  imageLink?: string;
  description: string;
  daysToDeliver: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://978358-test-with-taryn-env.eba-ykmz27pv.us-west-2.elasticbeanstalk.com/api/products';
  private productsSubject = new BehaviorSubject<Product[]>([]);
  public products$ = this.productsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadProducts();
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  private handleError(error: any): Observable<never> {
    console.error('Product service error:', error);
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      if (error.status === 403) {
        errorMessage = 'Admin access required to create products';
      } else if (error.status === 401) {
        errorMessage = 'Please log in to create products';
      }
    }

    return throwError(() => new Error(errorMessage));
  }

  private loadProducts(): void {
    this.http.get<Product[]>(this.apiUrl).subscribe({
      next: (products) => {
        this.productsSubject.next(products);
      },
      error: (error) => {
        console.error('Error fetching products:', error);
        // Fallback to empty array or handle error as needed
        this.productsSubject.next([]);
      }
    });
  }

  getProductByName(name: string): Product | undefined {
    const products = this.productsSubject.value;
    return products.find(product => product.productName === name);
  }

  getProductById(id: number): Product | undefined {
    const products = this.productsSubject.value;
    return products.find(product => product.productId === id);
  }

  getAllProducts(): Product[] {
    return this.productsSubject.value;
  }

  refreshProducts(): void {
    this.loadProducts();
  }

  /**
   * Create a new product (Admin only)
   */
  createProduct(productData: CreateProductRequest): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, productData, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }
}
