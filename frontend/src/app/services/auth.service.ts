import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private selectedShopIdSubject = new BehaviorSubject<number | null>(null);
  public selectedShopId$ = this.selectedShopIdSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.loadUser();
  }

  private loadUser() {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        // Check expiry
        if (decoded.exp * 1000 < Date.now()) {
          this.logout();
        } else {
          this.currentUserSubject.next(decoded);
          if (decoded.role !== 'SUPER_ADMIN') {
            this.selectedShopIdSubject.next(decoded.shopId);
          } else {
            const savedShopId = localStorage.getItem('selectedShopId');
            if (savedShopId) {
              this.selectedShopIdSubject.next(Number(savedShopId));
            }
          }
        }
      } catch (e) {
        this.logout();
      }
    }
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((res: any) => {
        localStorage.setItem('token', res.token);
        const decoded: any = jwtDecode(res.token);
        this.currentUserSubject.next(decoded);
        if (decoded.role !== 'SUPER_ADMIN') {
          this.selectedShopIdSubject.next(decoded.shopId);
        } else {
          localStorage.removeItem('selectedShopId');
          this.selectedShopIdSubject.next(null);
        }
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('selectedShopId');
    this.currentUserSubject.next(null);
    this.selectedShopIdSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): any {
    return this.currentUserSubject.value;
  }

  setSelectedShopId(id: number | null) {
    if (id) {
      localStorage.setItem('selectedShopId', id.toString());
    } else {
      localStorage.removeItem('selectedShopId');
    }
    this.selectedShopIdSubject.next(id);
  }

  getSelectedShopId(): number | null {
    return this.selectedShopIdSubject.value;
  }
}
