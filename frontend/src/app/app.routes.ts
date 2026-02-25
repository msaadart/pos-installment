import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    {
        path: '',
        component: MainLayoutComponent,
        canActivate: [authGuard],
        children: [
            { path: 'dashboard', component: DashboardComponent },
            {
                path: 'shops',
                loadComponent: () => import('./pages/shops/shops.component')
                    .then(m => m.ShopsComponent),
                canActivate: [roleGuard],
                data: { roles: ['SUPER_ADMIN'] }
            },
            {
                path: 'users',
                loadComponent: () => import('./pages/users/users.component')
                    .then(m => m.UsersComponent),
                canActivate: [roleGuard],
                data: { roles: ['SUPER_ADMIN'] }
            },
            {
                path: 'products',
                loadComponent: () => import('./pages/products/products.component')
                    .then(m => m.ProductsComponent)
            },
            { path: 'pos', loadComponent: () => import('./pages/pos/pos.component').then(m => m.PosComponent) },
            { path: 'installments', loadComponent: () => import('./pages/installments/installments.component').then(m => m.InstallmentsComponent) },
            {
                path: 'reports',
                loadComponent: () => import('./pages/reports/reports.component')
                    .then(m => m.ReportsComponent),
                canActivate: [roleGuard],
                data: { roles: ['SUPER_ADMIN', 'SHOP_ADMIN'] }
            },
            {
                path: 'purchases',
                loadComponent: () => import('./pages/purchases/purchases.component')
                   .then(m => m.PurchasesComponent),
                canActivate: [roleGuard],
                data: { roles: ['SUPER_ADMIN', 'SHOP_ADMIN'] }
            },
            { path: 'expenses', loadComponent: () => import('./pages/expenses/expenses.component').then(m => m.ExpensesComponent) },
            { path: 'customers', loadComponent: () => import('./pages/customers/customers.component').then(m => m.CustomersComponent) },
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    },
    { path: '**', redirectTo: 'dashboard' }
];
