import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface Category {
    categoryId: number;
    categoryName: string;
}

@Injectable({
    providedIn: 'root'
})
export class CategoryService {
    private apiUrl = 'http://978323-api-gateway.eba-ykmz27pv.us-west-2.elasticbeanstalk.com/api/categories';

    constructor(private http: HttpClient) { }

    private getAuthHeaders(): HttpHeaders {
        const token = localStorage.getItem('authToken');
        return new HttpHeaders({
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        });
    }

    private handleError(error: any): Observable<never> {
        console.error('Category service error:', error);
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

    // Get all categories (public endpoint)
    getAllCategories(): Observable<Category[]> {
        return this.http.get<Category[]>(this.apiUrl).pipe(
            catchError(this.handleError)
        );
    }

    // Create new category (admin only)
    createCategory(categoryName: string): Observable<Category> {
        const categoryData = { categoryName };
        return this.http.post<Category>(this.apiUrl, categoryData, {
            headers: this.getAuthHeaders()
        }).pipe(
            catchError(this.handleError)
        );
    }

    // Update category (admin only)
    updateCategory(categoryId: number, categoryName: string): Observable<Category> {
        const categoryData = { categoryName };
        return this.http.put<Category>(`${this.apiUrl}/${categoryId}`, categoryData, {
            headers: this.getAuthHeaders()
        }).pipe(
            catchError(this.handleError)
        );
    }

    // Delete category (admin only)
    deleteCategory(categoryId: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${categoryId}`, {
            headers: this.getAuthHeaders()
        }).pipe(
            catchError(this.handleError)
        );
    }
}
