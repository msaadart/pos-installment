import { Component, OnInit } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

import { ReportService } from '../../services/report.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, AsyncPipe],
  template: `
    <div *ngIf="user$ | async as user">
      <div class="container" style="padding-top: 2rem;">
        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h1>Welcome, {{ user.name }}!</h1>
            <button class="btn btn-danger" (click)="logout()">Logout</button>
          </div>
          <p style="margin-top: 1rem; color: var(--text-muted);">
            Role: <strong>{{ user.role }}</strong>
          </p>
        </div>

        <div *ngIf="stats" style="margin-top: 2rem; display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;">
            <div class="card">
                <h3>Total Sales</h3>
                <p style="font-size: 2rem; font-weight: bold; color: var(--primary);">Rs. {{ stats.totalSales | number:'1.2-2' }}</p>
            </div>
            <div class="card">
                <h3>Total Products</h3>
                <p style="font-size: 2rem; font-weight: bold; color: var(--secondary);">{{ stats.totalProducts }}</p>
            </div>
            <div class="card">
                <h3>Active Installments</h3>
                <p style="font-size: 2rem; font-weight: bold; color: var(--accent);">{{ stats.activeInstallmentsCount }}</p>
            </div>
        </div>

        <div *ngIf="stats?.recentSales" class="card" style="margin-top: 2rem;">
            <h3>Recent Sales</h3>
            <table style="width: 100%; border-collapse: collapse; margin-top: 1rem;">
                <thead>
                    <tr style="text-align: left; border-bottom: 1px solid var(--border-color);">
                        <th style="padding: 0.5rem;">Invoice</th>
                        <th style="padding: 0.5rem;">Date</th>
                        <th style="padding: 0.5rem;">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr *ngFor="let sale of stats.recentSales" style="border-bottom: 1px solid var(--border-color);">
                        <td style="padding: 0.5rem;">{{ sale.invoiceNo }}</td>
                        <td style="padding: 0.5rem;">{{ sale.createdAt | date:'shortDate' }}</td>
                        <td style="padding: 0.5rem;">Rs. {{ sale.totalAmount | number:'1.2-2' }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  user$ = this.authService.currentUser$;
  stats: any = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private reportService: ReportService
  ) { }

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.reportService.getDashboardStats().subscribe(data => this.stats = data);
  }

  logout() {
    this.authService.logout();
  }
}
