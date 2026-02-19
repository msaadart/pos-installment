import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class PurchaseService {
    private apiUrl = environment.apiUrl+'/purchases';

    constructor(private http: HttpClient) { }

    createPurchase(purchaseData: any): Observable<any> {
        return this.http.post(this.apiUrl, purchaseData);
    }

    getAllPurchases(shopId?: number): Observable<any[]> {
        const url = shopId ? `${this.apiUrl}?shopId=${shopId}` : this.apiUrl;
        return this.http.get<any[]>(url);
    }

    getPurchaseById(id: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/${id}`);
    }

    getAllSuppliers(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/suppliers`);
    }

    createSupplier(supplierData: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/suppliers`, supplierData);
    }
}
