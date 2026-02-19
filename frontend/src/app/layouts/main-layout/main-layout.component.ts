import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-layout">
      <aside class="sidebar">
        <div class="sidebar-header" style="padding: 2rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1);">
          <h2 style="color: white; font-weight: 700;">Installment AI</h2>
        </div>
        <nav class="sidebar-nav" style="padding: 1rem 0;">
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">Dashboard</a>
          <a routerLink="/pos" routerLinkActive="active" class="nav-item">POS (Sales)</a>
          <a routerLink="/installments" routerLinkActive="active" class="nav-item">Installment Plans</a>
          <a routerLink="/customers" routerLinkActive="active" class="nav-item">Customers</a>
          <a routerLink="/products" routerLinkActive="active" class="nav-item">Products</a>
          <a routerLink="/purchases" routerLinkActive="active" class="nav-item">Purchases</a>
          <a routerLink="/expenses" routerLinkActive="active" class="nav-item">Expenses</a>
          <a *ngIf="user?.role === 'SUPER_ADMIN'" routerLink="/shops" routerLinkActive="active" class="nav-item">Shops</a>
          <a *ngIf="['SUPER_ADMIN', 'SHOP_ADMIN'].includes(user?.role)" routerLink="/users" routerLinkActive="active" class="nav-item">Users</a>
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
  `]
})
export class MainLayoutComponent {
  user: any;

  constructor(private authService: AuthService) {
    this.authService.currentUser$.subscribe(u => this.user = u);
  }

  logout() {
    this.authService.logout();
  }
}
