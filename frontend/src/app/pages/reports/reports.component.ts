import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../services/report.service';

@Component({
    selector: 'app-reports',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="container" style="padding-top: 2rem;">
      <h2 style="margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center;">Reports <button class="btn btn-primary" (click)="downloadPDF()">Download PDF</button></h2>

      <div class="tabs" style="display: flex; gap: 1rem; margin-bottom: 2rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem; align-items: center;">
          <button class="btn" [class.btn-primary]="activeTab === 'sales'" (click)="setTab('sales')">Sales</button>
          <button class="btn" [class.btn-primary]="activeTab === 'stock'" (click)="setTab('stock')">Low Stock</button>
          <button class="btn" [class.btn-primary]="activeTab === 'due'" (click)="setTab('due')">Installments Due</button>
          <button class="btn" [class.btn-primary]="activeTab === 'summary'" (click)="setTab('summary')">Customer Summary</button>
          
          <div class="form-group" style="margin-left: auto; display: flex; gap: 1rem;">
             <input *ngIf="['due', 'summary'].includes(activeTab)" type="text" class="form-control" placeholder="Phone..." [(ngModel)]="searchPhone" >
             <input *ngIf="['due', 'summary'].includes(activeTab)" type="text" class="form-control" placeholder="CNIC..." [(ngModel)]="searchCNIC" >
             <button *ngIf="['due', 'summary'].includes(activeTab)" class="btn btn-secondary" (click)="loadCurrentTab()">Search</button>
          </div>
      </div>

      <!-- Sales Report -->
      <div *ngIf="activeTab === 'sales'" class="card">
        <h3>Sales Report</h3>
        <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
            <input type="date" class="form-control" [(ngModel)]="startDate">
            <input type="date" class="form-control" [(ngModel)]="endDate">
            <button class="btn btn-primary" (click)="loadSales()">Generate</button>
        </div>
        
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="text-align: left; border-bottom: 1px solid var(--border-color);">
                    <th style="padding: 1rem;">Invoice</th>
                    <th style="padding: 1rem;">Date</th>
                    <th style="padding: 1rem;">User</th>
                    <th style="padding: 1rem;">Amount</th>
                    <th style="padding: 1rem;">Type</th>
                </tr>
            </thead>
            <tbody>
                <tr *ngFor="let sale of sales" style="border-bottom: 1px solid var(--border-color);">
                    <td style="padding: 1rem;">{{ sale.invoiceNo }}</td>
                    <td style="padding: 1rem;">{{ sale.createdAt | date }}</td>
                    <td style="padding: 1rem;">{{ sale.user?.name }}</td>
                    <td style="padding: 1rem;">Rs. {{ sale.totalAmount | number:'1.2-2' }}</td>
                    <td style="padding: 1rem;">{{ sale.saleType }}</td>
                </tr>
            </tbody>
        </table>
      </div>

      <!-- Low Stock Report -->
      <div *ngIf="activeTab === 'stock'" class="card">
        <h3>Low Stock Report</h3>
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="text-align: left; border-bottom: 1px solid var(--border-color);">
                    <th style="padding: 1rem;">Product</th>
                    <th style="padding: 1rem;">Current Stock</th>
                    <th style="padding: 1rem;">Min Stock</th>
                    <th style="padding: 1rem;">Status</th>
                </tr>
            </thead>
            <tbody>
                <tr *ngFor="let item of stock" style="border-bottom: 1px solid var(--border-color);">
                    <td style="padding: 1rem;">{{ item.name }}</td>
                    <td style="padding: 1rem; color: var(--danger); font-weight: bold;">{{ item.stock }}</td>
                    <td style="padding: 1rem;">{{ item.minStock }}</td>
                    <td style="padding: 1rem;"><span class="badge badge-danger">Reorder</span></td>
                </tr>
            </tbody>
        </table>
      </div>

      <!-- Installments Due -->
      <div *ngIf="activeTab === 'due'" class="card">
          <h3>Installments Due / Overdue</h3>
          <table style="width: 100%; border-collapse: collapse;">
              <thead>
                  <tr style="text-align: left; border-bottom: 1px solid var(--border-color);">
                      <th style="padding: 1rem;">Customer</th>
                      <th style="padding: 1rem;">Due Date</th>
                      <th style="padding: 1rem;">Amount</th>
                      <th style="padding: 1rem;">Balance</th>
                      <th style="padding: 1rem;">Status</th>
                  </tr>
              </thead>
              <tbody>
                  <tr *ngFor="let item of dueInstallments" style="border-bottom: 1px solid var(--border-color);">
                      <td style="padding: 1rem;">{{ item.plan.sale.customer?.name }}</td>
                      <td style="padding: 1rem;">{{ item.dueDate | date }}</td>
                      <td style="padding: 1rem;">Rs. {{ item.amount | number:'1.2-2' }}</td>
                      <td style="padding: 1rem;">Rs. {{ (item.amount - item.paidAmount) | number:'1.2-2' }}</td>
                      <td style="padding: 1rem;">
                          <span [style.color]="isOverdue(item.dueDate) ? 'var(--danger)' : 'var(--warning)'">
                              {{ isOverdue(item.dueDate) ? 'OVERDUE' : 'DUE' }}
                          </span>
                      </td>
                  </tr>
              </tbody>
          </table>
      </div>

      <!-- Customer Summary -->
      <div *ngIf="activeTab === 'summary'" class="card">
          <h3>Customer Installment Summary</h3>
          <table style="width: 100%; border-collapse: collapse;">
              <thead>
                  <tr style="text-align: left; border-bottom: 1px solid var(--border-color);">
                      <th style="padding: 1rem;">Customer</th>
                      <th style="padding: 1rem;">Active Plans</th>
                      <th style="padding: 1rem;">Paid So Far</th>
                      <th style="padding: 1rem;">Remaining</th>
                      <th style="padding: 1rem;">Currently Due</th>
                  </tr>
              </thead>
              <tbody>
                  <tr *ngFor="let item of customerSummary" style="border-bottom: 1px solid var(--border-color);">
                      <td style="padding: 1rem;">{{ item.name }}</td>
                      <td style="padding: 1rem;">{{ item.totalItems }}</td>
                      <td style="padding: 1rem;">Rs. {{ item.totalPaid | number:'1.2-2' }}</td>
                      <td style="padding: 1rem;">Rs. {{ item.remainingBalance | number:'1.2-2' }}</td>
                      <td style="padding: 1rem; color: var(--danger); font-weight: bold;">Rs. {{ item.dueAmount | number:'1.2-2' }}</td>
                  </tr>
              </tbody>
          </table>
      </div>
    </div>
  `,
    styles: [`
    @media print { 
      .tabs, .btn, .form-control, h2 { display: none !important; }
      .container { padding: 0 !important; }
      .card { border: none !important; box-shadow: none !important; padding: 0 !important; }
      table { border-collapse: collapse !important; width: 100% !important; margin: 0 !important; }
      th, td { border: 1px solid #ddd !important; padding: 2px !important; font-size: 8pt !important; }
      h3 { display: block !important; text-align: center; margin-bottom: 5px !important; }
      ::ng-deep .sidebar { display: none !important; }
    }
    .btn-secondary { background: var(--secondary); color: white; }
    .btn-tertiary { background: var(--text-muted); color: white; }
  `]
})
export class ReportsComponent implements OnInit {
    activeTab: 'sales' | 'stock' | 'due' | 'summary' = 'sales';
    sales: any[] = [];
    stock: any[] = [];
    dueInstallments: any[] = [];
    customerSummary: any[] = [];

    startDate = new Date().toISOString().split('T')[0];
    endDate = new Date().toISOString().split('T')[0];
    searchPhone = '';
    searchCNIC = '';

    constructor(private reportService: ReportService) { }

    ngOnInit() {
        this.loadSales();
    }

    setTab(tab: any) {
        this.activeTab = tab;
        this.loadCurrentTab();
    }

    loadCurrentTab() {
        if (this.activeTab === 'sales') this.loadSales();
        if (this.activeTab === 'stock') this.loadStock();
        if (this.activeTab === 'due') this.loadDue();
        if (this.activeTab === 'summary') this.loadSummary();
    }

    loadSales() {
        this.reportService.getSalesReport(this.startDate, this.endDate).subscribe(data => this.sales = data);
    }

    loadStock() {
        this.reportService.getStockReport().subscribe(data => this.stock = data);
    }

    loadDue() {
        const filters = { phone: this.searchPhone, cnic: this.searchCNIC };
        this.reportService.getInstallmentDueReport(filters).subscribe(data => this.dueInstallments = data);
    }

    loadSummary() {
        const filters = { phone: this.searchPhone, cnic: this.searchCNIC };
        this.reportService.getCustomerSummary(filters).subscribe(data => this.customerSummary = data);
    }

    isOverdue(date: string) {
        return new Date(date) < new Date();
    }

    downloadPDF() {
        // High-quality print approach which user can save as PDF
        window.print();
    }
}
