import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    private apiUrl = environment.apiUrl + '/products';

    constructor(private http: HttpClient) { }

    getAllProducts(filters: any = {}): Observable<any[]> {
        return this.http.get<any[]>(this.apiUrl, { params: filters });
    }

    createProduct(product: any): Observable<any> {
        return this.http.post<any>(this.apiUrl, product);
    }

    updateProduct(id: number, product: any): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/${id}`, product);
    }

    getAllCategories(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/categories`);
    }

    getAllBrands(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/brands`);
    }

    createCategory(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/categories`, data);
    }

    createBrand(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/brands`, data);
    }
}
