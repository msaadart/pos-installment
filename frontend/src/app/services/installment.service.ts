import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class InstallmentService {
    private apiUrl = environment.apiUrl + '/installments';

    constructor(private http: HttpClient) { }

    createInstallmentSale(data: any): Observable<any> {
        return this.http.post(this.apiUrl, data);
    }

    getInstallmentPlans(filters: any = {}): Observable<any[]> {
        return this.http.get<any[]>(this.apiUrl, { params: filters });
    }

    payInstallment(id: number, amount: number, paymentMethod: string = 'CASH', referenceId?: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/${id}/pay`, { amount, paymentMethod, referenceId });
    }
}
