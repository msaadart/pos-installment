import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ExpenseService {
    private apiUrl = environment.apiUrl + '/expenses';

    constructor(private http: HttpClient) { }

    createExpense(expenseData: any): Observable<any> {
        return this.http.post(this.apiUrl, expenseData);
    }

    getAllExpenses(filters: any = {}): Observable<any> {
        return this.http.get<any>(this.apiUrl, { params: filters });
    }

    deleteExpense(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }
}
