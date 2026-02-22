import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
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
    const cloned = req.clone({
      setHeaders: headers
    });
    return next(cloned);
  }

  return next(req);
};
