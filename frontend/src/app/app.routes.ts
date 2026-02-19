import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ShopsComponent } from './pages/shops/shops.component';
import { UsersComponent } from './pages/users/users.component';
import { ProductsComponent } from './pages/products/products.component';
import { PosComponent } from './pages/pos/pos.component';
import { InstallmentsComponent } from './pages/installments/installments.component';
import { ReportsComponent } from './pages/reports/reports.component';
import { PurchasesComponent } from './pages/purchases/purchases.component';
import { ExpensesComponent } from './pages/expenses/expenses.component';
import { CustomersComponent } from './pages/customers/customers.component';
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
                component: ShopsComponent,
                canActivate: [roleGuard],
                data: { roles: ['SUPER_ADMIN'] }
            },
            {
                path: 'users',
                component: UsersComponent,
                canActivate: [roleGuard],
                data: { roles: ['SUPER_ADMIN', 'SHOP_ADMIN'] }
            },
            { path: 'products', component: ProductsComponent },
            { path: 'pos', component: PosComponent },
            { path: 'installments', component: InstallmentsComponent },
            {
                path: 'reports',
                component: ReportsComponent,
                canActivate: [roleGuard],
                data: { roles: ['SUPER_ADMIN', 'SHOP_ADMIN'] }
            },
            { path: 'purchases', component: PurchasesComponent },
            { path: 'expenses', component: ExpensesComponent },
            { path: 'customers', component: CustomersComponent },
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    },
    { path: '**', redirectTo: 'dashboard' }
];
