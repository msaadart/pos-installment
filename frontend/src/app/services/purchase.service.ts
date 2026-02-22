import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class PurchaseService {
    private apiUrl = environment.apiUrl + '/purchases';

    constructor(private http: HttpClient) { }

    createPurchase(purchaseData: any): Observable<any> {
        return this.http.post(this.apiUrl, purchaseData);
    }

    getAllPurchases(supplierId?: number): Observable<any[]> {
        let url = this.apiUrl;
        if (supplierId) {
            url += `?supplierId=${supplierId}`;
        }
        return this.http.get<any[]>(url);
    }

    getPurchaseById(id: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/${id}`);
    }

    deleteSupplier(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/suppliers/${id}`);
    }

    clearSupplierBalance(id: number): Observable<any> {
        return this.http.patch(`${this.apiUrl}/suppliers/${id}/clear-balance`, {});
    }

    clearPurchaseBalance(id: number, amount: number): Observable<any> {
        return this.http.patch(`${this.apiUrl}/${id}/clear-balance`, { amount });
    }

    getAllSuppliers(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/suppliers`);
    }

    createSupplier(supplierData: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/suppliers`, supplierData);
    }
}
