import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

export interface Product {
  productId: number;
  productName: string;
  inventory: number;
  price: number;
  imageLink: string;
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
}
