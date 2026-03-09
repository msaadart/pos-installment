import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, finalize, throwError } from 'rxjs';
import { LoadingService } from '../services/loading.service';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const loadingService = inject(LoadingService);
  const router = inject(Router);

  const token = authService.getToken();
  const shopId = authService.getSelectedShopId();

  let headers: any = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (shopId) {
    headers['X-Shop-Id'] = shopId.toString();
  }

  if (Object.keys(headers).length > 0) {
    req = req.clone({
      setHeaders: headers
    });
  }

  // Start Loader
  loadingService.show();

  return next(req).pipe(
    catchError((error) => {
      if (
        error.status === 401 ||
        error?.error?.message === 'Unauthorized: Invalid token'
      ) {
        authService.logout(); // optional: clear token
        router.navigate(['/login']);
      }

      return throwError(() => error);
    }),
    finalize(() => {
      // Stop Loader (even if error occurs)
      loadingService.hide();
    })
  );
};
