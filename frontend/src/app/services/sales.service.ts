import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class SalesService {
    private apiUrl = environment.apiUrl+'/sales';

    constructor(private http: HttpClient) { }

    createSale(data: any): Observable<any> {
        return this.http.post(this.apiUrl, data);
    }

    getAllSales(filters?: any): Observable<any[]> {
        let url = this.apiUrl;
        // Simple query string builder
        if (filters) {
            const query = new URLSearchParams(filters).toString();
            url += `?${query}`;
        }
        return this.http.get<any[]>(url);
    }
}
