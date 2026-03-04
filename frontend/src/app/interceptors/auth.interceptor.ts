import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { finalize } from 'rxjs';
import { LoadingService } from '../services/loading.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const loadingService = inject(LoadingService);

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
    finalize(() => {
      // Stop Loader (even if error occurs)
      loadingService.hide();
    })
  );
};
