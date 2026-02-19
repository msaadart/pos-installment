import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ShopService {
  private apiUrl = environment.apiUrl+'/shops';

  constructor(private http: HttpClient) { }

  getAllShops(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  createShop(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  updateShop(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }
}
