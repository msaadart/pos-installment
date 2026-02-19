import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class CustomerService {
    private apiUrl = `${environment.apiUrl}/customers`;

    constructor(private http: HttpClient) { }

    getAllCustomers(): Observable<any[]> {
        return this.http.get<any[]>(this.apiUrl);
    }

    getCustomerById(id: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/${id}`);
    }

    createCustomer(customer: any): Observable<any> {
        return this.http.post<any>(this.apiUrl, customer);
    }

    updateCustomer(id: number, customer: any): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/${id}`, customer);
    }

    deleteCustomer(id: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/${id}`);
    }
}
