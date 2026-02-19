import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ReportService {
    private apiUrl = environment.apiUrl + '/reports';

    constructor(private http: HttpClient) { }

    getDashboardStats(): Observable<any> {
        return this.http.get(`${this.apiUrl}/dashboard`);
    }

    getSalesReport(startDate: string, endDate: string): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/sales?startDate=${startDate}&endDate=${endDate}`);
    }

    getStockReport(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/stock`);
    }

    getInstallmentDueReport(filters: any = {}): Observable<any[]> {
        let queryParams = '';
        if (filters.phone) queryParams += `phone=${filters.phone}&`;
        if (filters.cnic) queryParams += `cnic=${filters.cnic}&`;
        const url = queryParams ? `${this.apiUrl}/installment-due?${queryParams}` : `${this.apiUrl}/installment-due`;
        return this.http.get<any[]>(url);
    }

    getCustomerSummary(filters: any = {}): Observable<any[]> {
        let queryParams = '';
        if (filters.phone) queryParams += `phone=${filters.phone}&`;
        if (filters.cnic) queryParams += `cnic=${filters.cnic}&`;
        const url = queryParams ? `${this.apiUrl}/customer-summary?${queryParams}` : `${this.apiUrl}/customer-summary`;
        return this.http.get<any[]>(url);
    }
}
