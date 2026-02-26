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

    getAllPurchases(filters: any = {}): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}`, { params: filters });
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

    clearPurchaseBalance(id: number, amount: number, method?: string, notes?: string): Observable<any> {
        const body: any = { amount };
        if (method) body.method = method;
        if (notes) body.notes = notes;
        return this.http.patch(`${this.apiUrl}/${id}/clear-balance`, body);
    }

    getAllSuppliers(filters: any = {}): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/suppliers`, { params: filters });
    }

    getAllPurchasePayments(filters: any = {}): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/payments`, { params: filters });
    }

    createSupplier(supplierData: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/suppliers`, supplierData);
    }
}
