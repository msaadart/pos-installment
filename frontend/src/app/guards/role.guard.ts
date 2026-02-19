import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user = authService.getCurrentUser();

  if (!user) {
    return router.createUrlTree(['/login']);
  }

  const requiredRoles = route.data?.['roles'] as Array<string>;
  
  if (!requiredRoles || requiredRoles.includes(user.role)) {
    return true;
  }

  // Redirect to dashboard or access denied if unauthorized
  alert('Access Denied: You do not have permission to view this page.');
  return router.createUrlTree(['/dashboard']);
};
