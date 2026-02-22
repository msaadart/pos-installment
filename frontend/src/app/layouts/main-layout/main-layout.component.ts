import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ShopService } from '../../services/shop.service';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, FormsModule],
  template: `
    <div class="app-layout">
      <aside class="sidebar">
        <div class="sidebar-header" style="padding: 1.5rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1);">
          <h2 style="color: white; font-weight: 700; margin-bottom: 1rem;">giftokarachi.com</h2>
          
          <!-- Shop Selector for Super Admin -->
          <div class="shop-selector" style="margin-top: 1rem;">
            <label style="color: rgba(255,255,255,0.5); font-size: 0.75rem; display: block; text-align: left; margin-bottom: 0.3rem;">SELECT SHOP</label>
            <select class="shop-dropdown" [(ngModel)]="selectedShopId" (change)="onShopChange()" 
            [disabled]="user?.role !== 'SUPER_ADMIN'"
            style="width: 100%; background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2); padding: 0.5rem; border-radius: 4px; outline: none; cursor: pointer;">
              <option [value]="null">All Shops</option>
              <option *ngFor="let shop of shops" [value]="shop.id">{{ shop.name }}</option>
            </select>
          </div>
          
        </div>
        <nav class="sidebar-nav" style="padding: 1rem 0;">
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">Dashboard</a>
          <a routerLink="/pos" routerLinkActive="active" class="nav-item">POS (Sales)</a>
          <a routerLink="/installments" routerLinkActive="active" class="nav-item">Installment Plans</a>
          <a routerLink="/customers" routerLinkActive="active" class="nav-item">Customers</a>
          <a routerLink="/products" routerLinkActive="active" class="nav-item">Products</a>
          <a *ngIf="['SUPER_ADMIN', 'SHOP_ADMIN'].includes(user?.role)"  routerLink="/purchases" routerLinkActive="active" class="nav-item">Purchases</a>
          <a routerLink="/expenses" routerLinkActive="active" class="nav-item">Expenses</a>
          <a *ngIf="user?.role === 'SUPER_ADMIN'" routerLink="/shops" routerLinkActive="active" class="nav-item">Shops</a>
          <a *ngIf="['SUPER_ADMIN'].includes(user?.role)" routerLink="/users" routerLinkActive="active" class="nav-item">Users</a>
          <a *ngIf="['SUPER_ADMIN', 'SHOP_ADMIN'].includes(user?.role)" routerLink="/reports" routerLinkActive="active" class="nav-item">Reports</a>
        </nav>
        <div class="sidebar-footer" style="margin-top: auto; padding: 1rem; border-top: 1px solid rgba(255,255,255,0.1);">
          <button class="btn btn-danger" style="width: 100%;" (click)="logout()">Logout</button>
        </div>
      </aside>
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .nav-item {
      display: block;
      padding: 0.75rem 2rem;
      color: rgba(255,255,255,0.7);
      text-decoration: none;
      transition: all 0.2s;
    }
    .nav-item:hover {
      background: rgba(255,255,255,0.05);
      color: white;
    }
    .nav-item.active {
      background: var(--primary);
      color: white;
      border-right: 4px solid var(--accent);
    }
    .sidebar {
      display: flex;
      flex-direction: column;
    }
    .shop-dropdown option {
      background: #2c3e50;
      color: white;
    }
  `]
})
export class MainLayoutComponent {
  user: any;
  shops: any[] = [];
  selectedShopId: number | null = null;
  private subs = new Subscription();

  constructor(
    private authService: AuthService,
    private shopService: ShopService
  ) {
    this.subs.add(
      this.authService.currentUser$.subscribe(u => {
        this.user = u;
        //if (u?.role === 'SUPER_ADMIN') {
          this.loadShops();
        //}
      })
    );
    this.subs.add(
      this.authService.selectedShopId$.subscribe(id => {
        this.selectedShopId = id;
      })
    );
  }

  loadShops() {
    this.shopService.getAllShops().subscribe(data => {
      this.shops = data;
    });

    //  if (this.user?.role !== 'SUPER_ADMIN') {
    //         this.expenseForm.patchValue({ shopId: this.user.shopId });
    //         this.expenseForm.get('shopId')?.disable();
    //     } else {
    //         this.expenseForm.get('shopId')?.enable();
    //     }
  }

  onShopChange() {
    this.authService.setSelectedShopId(this.selectedShopId ? Number(this.selectedShopId) : null);
    // Reload current route or trigger global data refresh if necessary
    // Most components will fetch based on the selector from AuthService or Interceptor
    window.location.reload(); // Simple way to refresh all data for the new shop
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  logout() {
    this.authService.logout();
  }
}
