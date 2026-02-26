import { Component, OnInit } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

import { FormsModule } from '@angular/forms';
import { ReportService } from '../../services/report.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, AsyncPipe, FormsModule],
  template: `
    <div *ngIf="user$ | async as user">
      <div class="container" style="padding-top: 2rem;">
        <!--<div class="card">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h1>Welcome, {{ user.name }}!</h1>
            <button class="btn btn-danger" (click)="logout()">Logout</button>
          </div>
          <p style="margin-top: 1rem; color: var(--text-muted);">
            Role: <strong>{{ user.role }}</strong>
          </p>
        </div>-->

        <!-- Filters -->
        <div class="card" style="display: flex; gap: 1rem; margin-bottom: 1rem;">
          
                <input type="date" class="form-control" [(ngModel)]="startDate">
          
                <input type="date" class="form-control" [(ngModel)]="endDate">
           
            <button class="btn btn-primary" (click)="loadStats()">Search</button>
            <button class="btn btn-secondary" (click)="resetFilters()">Reset</button>
        </div>

        <div *ngIf="stats" class="card" style="margin-top: 2rem; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem;">
            <div style="padding-left:10px; border-left: 5px solid var(--primary);">
                <h3>Total Sales</h3>
                <p style="font-size: 1rem; font-weight: bold; color: var(--primary);">Rs. {{ stats.totalSales | number:'1.2-2' }}</p>
            </div>
            <div style="padding-left:10px; border-left: 5px solid var(--danger);">
                <h3>Total Expenses</h3>
                <p style="font-size: 1rem; font-weight: bold; color: var(--danger);">Rs. {{ stats.totalExpenses | number:'1.2-2' }}</p>
            </div>
            <div style="padding-left:10px; border-left: 5px solid var(--secondary);">
                <h3>Total Products</h3>
                <p style="font-size: 1rem; font-weight: bold; color: var(--secondary);">{{ stats.totalProducts }}</p>
            </div>
            <div style="padding-left:10px; border-left: 5px solid var(--accent);">
                <h3>Active Installments</h3>
                <p style="font-size: 1rem; font-weight: bold; color: var(--accent);">{{ stats.activeInstallmentsCount }}</p>
            </div>
            <div style="padding-left:10px; border-left: 5px solid #6f42c1;">
                <h3>Total Customers</h3>
                <p style="font-size: 1rem; font-weight: bold; color: #6f42c1;">{{ stats.totalCustomers }}</p>
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
  startDate: string = '';
  endDate: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private reportService: ReportService
  ) { }

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    const filters: any = {};
    if (this.startDate) filters.startDate = this.startDate;
    if (this.endDate) filters.endDate = this.endDate;
    this.reportService.getDashboardStats(filters).subscribe(data => this.stats = data);
  }

  resetFilters() {
    this.startDate = '';
    this.endDate = '';
    this.loadStats();
  }

  logout() {
    this.authService.logout();
  }
}
