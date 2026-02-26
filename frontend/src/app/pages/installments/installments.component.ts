import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InstallmentService } from '../../services/installment.service';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-installments',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="container" style="padding-top: 2rem;">
      <h2 style="margin-bottom: 2rem;">Installment Plans</h2>

      <div class="card" style="display: flex; gap: 1rem; margin-bottom: 2rem; align-items: flex-end;">
        <div style="flex: 1;">
            <label class="form-label" style="font-size: 0.8rem;">Phone</label>
            <input type="text" class="form-control" placeholder="Search by Phone..." [(ngModel)]="searchPhone">
        </div>
        <div style="flex: 1;">
            <label class="form-label" style="font-size: 0.8rem;">CNIC</label>
            <input type="text" class="form-control" placeholder="Search by CNIC..." [(ngModel)]="searchCNIC">
        </div>
        <div style="flex: 1;">
            <label class="form-label" style="font-size: 0.8rem;">Status</label>
            <select class="form-control" [(ngModel)]="searchStatus">
                <option value="">All Statuses</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="COMPLETED">COMPLETED</option>
            </select>
        </div>
        <div>
            <button class="btn btn-primary" (click)="loadPlans()">Search</button>
            <button class="btn btn-secondary" style="margin-left: 0.5rem;" (click)="resetFilters()">Clear</button>
        </div>
      </div>

      <div class="card">
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="text-align: left; border-bottom: 1px solid var(--border-color);">
                    <th style="padding: 0.5rem;">ID</th>
                    <th style="padding: 0.5rem;">Customer</th>
                    <th style="padding: 0.5rem;">Total Amount</th>
                    <th style="padding: 0.5rem;">Start Date</th>
                    <th style="padding: 0.5rem;">End Date</th>
                    <th style="padding: 0.5rem;">Status</th>
                    <th style="padding: 0.5rem;">Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr *ngFor="let plan of plans" style="border-bottom: 1px solid var(--border-color);">
                    <td style="padding: 0.5rem;">{{ plan.id }}</td>
                    <td style="padding: 0.5rem;">{{ plan.sale.customer?.name || 'Walk-in' }} ({{ plan.sale.customer?.cnic || '-' }})</td>
                    <td style="padding: 0.5rem;">Rs. {{ plan.totalAmount | number:'1.2-2' }}</td>
                    <td style="padding: 0.5rem;">{{ plan.startDate | date }}</td>
                    <td style="padding: 0.5rem;">{{ plan.endDate | date }}</td>
                    <td style="padding: 0.5rem;">
                        <span [style.color]="plan.status === 'ACTIVE' ? 'var(--success)' : 'var(--text-muted)'">
                            {{ plan.status }}
                        </span>
                    </td>
                    <td style="padding: 0.5rem;">
                        <button class="btn btn-primary" style="margin-right: 0.5rem;" (click)="viewDetails(plan)">View</button>
                        <button class="btn btn-secondary" (click)="printFullPlan(plan)">Print Plan</button>
                    </td>
                </tr>
            </tbody>
        </table>
      </div>

      <!-- Details Modal -->
      <div *ngIf="selectedPlan" class="card" style="margin-top: 2rem; border: 1px solid var(--primary);">
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <h3>Plan #{{ selectedPlan.id }} Details</h3>
            <button class="btn btn-secondary" (click)="selectedPlan = null">Close</button>
        </div>
        <div style="margin-top: 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
            <div>
                <p><strong>Customer:</strong> {{ selectedPlan.sale.customer?.name }} </p>
                <p><strong>Phone:</strong> {{ selectedPlan.sale.customer?.phone }}</p>
                <p><strong>Monthly Installment:</strong> Rs. {{ selectedPlan.monthlyInstallment | number:'1.2-2' }}</p>
            </div>
            <div>
                <p><strong>Total Amount:</strong> Rs. {{ selectedPlan.totalAmount | number:'1.2-2' }}</p>
                <p><strong>Down Payment:</strong> Rs. {{ selectedPlan.downPayment | number:'1.2-2' }}</p>
                <p><strong>Remaining Balance:</strong> Rs. {{ getRemaining(selectedPlan) | number:'1.2-2' }}</p>
            </div>
        </div>
        
        <h4 style="margin-top: 2rem;">Schedule</h4>
        <table style="width: 100%; border-collapse: collapse; margin-top: 1rem;">
            <thead>
                <tr style="text-align: left; border-bottom: 1px solid var(--border-color);">
                    <th style="padding: 0.5rem;">Due Date</th>
                    <th style="padding: 0.5rem;">Amount</th>
                    <th style="padding: 0.5rem;">Status</th>
                    <th style="padding: 0.5rem;">Payment Date</th>
                    <th style="padding: 0.5rem;">Action</th>
                </tr>
            </thead>
            <tbody>
                <tr *ngFor="let inst of selectedPlan.installments" style="border-bottom: 1px solid var(--border-color);">
                    <td style="padding: 0.5rem;">{{ inst.dueDate | date }}</td>
                    <td style="padding: 0.5rem;">Rs. {{ inst.amount | number:'1.2-2' }}</td>
                    <td style="padding: 0.5rem;">
                        <span [style.color]="inst.status === 'PAID' ? 'var(--success)' : 'var(--danger)'">{{ inst.status }}</span>
                    </td>
                    <td style="padding: 0.5rem;">{{ inst.paidAt | date:'shortDate' || '-' }}</td>
                    <td style="padding: 0.5rem;">
                        <button *ngIf="inst.status !== 'PAID'" class="btn btn-primary" (click)="openPayModal(inst)">Pay</button>
                        <button *ngIf="inst.status === 'PAID'" class="btn btn-secondary" (click)="printReceipt(selectedPlan, inst)">Receipt</button>
                    </td>
                </tr>
            </tbody>
        </table>
      </div>

      <!-- Payment Modal Overlay -->
      <div *ngIf="showPayModal" class="modal-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;">
          <div class="card" style="width: 400px; padding: 2rem;">
              <h3>Pay Installment</h3>
              <p style="margin-bottom: 1.5rem;">Amount: <strong>Rs. {{ currentInstallment.amount | number:'1.2-2' }}</strong></p>
              
              <div class="form-group">
                  <label class="form-label">Payment Type</label>
                  <select class="form-control" [(ngModel)]="paymentType">
                      <option value="CASH">CASH</option>
                      <option value="ONLINE">ONLINE</option>
                  </select>
              </div>

              <div *ngIf="paymentType === 'ONLINE'" class="form-group">
                  <label class="form-label">Reference ID (Required)</label>
                  <input type="text" class="form-control" [(ngModel)]="refId" placeholder="Enter online transfer ID">
              </div>

              <div style="display: flex; gap: 1rem; margin-top: 2rem;">
                  <button class="btn btn-secondary" style="flex: 1;" (click)="showPayModal = false">Cancel</button>
                  <button class="btn btn-primary" style="flex: 1;" [disabled]="paymentType === 'ONLINE' && !refId" (click)="processPayment()">Confirm</button>
              </div>
          </div>
      </div>

      <!-- Hidden Receipt Template for Printing -->
      <div id="thermal-receipt" style="display: none;">
          <div style="width: 80mm; padding: 5mm; font-family: 'Courier New', Courier, monospace; font-size: 12px; line-height: 1.2;">
              <div style="text-align: center; border-bottom: 1px dashed #000; padding-bottom: 5mm; margin-bottom: 5mm;">
                  <h2 style="margin: 0;">giftokarachi.com</h2>
                  <p style="margin: 5px 0;">PAYMENT RECEIPT</p>
              </div>
              <div style="margin-bottom: 5mm;">
                  <p><strong>Customer:</strong> {{ selectedPlan?.sale?.customer?.name }}</p>
                  <p><strong>Date:</strong> {{ currentReceipt?.date | date:'medium' }}</p>
                  <p><strong>Plan ID:</strong> {{ selectedPlan?.id }}</p>
                  <p><strong>Installment #:</strong> {{ currentReceipt?.instId }}</p>
              </div>
              <table style="width: 100%; border-bottom: 1px dashed #000; padding-bottom: 5mm; margin-bottom: 5mm;">
                  <tr>
                      <td style="padding: 2mm 0;"><strong>Paid Amount:</strong></td>
                      <td style="text-align: right; padding: 2mm 0;"><strong>Rs. {{ currentReceipt?.amount }}</strong></td>
                  </tr>
                  <tr>
                      <td style="padding: 2mm 0;">Payment Type:</td>
                      <td style="text-align: right; padding: 2mm 0;">{{ currentReceipt?.type }}</td>
                  </tr>
                  <tr *ngIf="currentReceipt?.refId">
                      <td style="padding: 2mm 0;">Ref ID:</td>
                      <td style="text-align: right; padding: 2mm 0;">{{ currentReceipt?.refId }}</td>
                  </tr>
              </table>
              <div style="margin-bottom: 5mm;">
                  <p><strong>Remaining Balance:</strong> Rs. {{ currentReceipt?.remaining }}</p>
              </div>
              <div style="text-align: center; margin-top: 10mm; border-top: 1px dashed #000; padding-top: 5mm;">
                  <p>Thank you for your payment!</p>
                  <p style="font-size: 10px;">{{ currentReceipt?.date | date:'yyyy-MM-dd HH:mm:ss' }}</p>
              </div>
          </div>
      </div>
    </div>
  `
})
export class InstallmentsComponent implements OnInit {
    plans: any[] = [];
    selectedPlan: any = null;

    showPayModal = false;
    currentInstallment: any = null;
    paymentType: 'CASH' | 'ONLINE' = 'CASH';
    refId: string = '';

    searchPhone = '';
    searchCNIC = '';
    searchStatus = '';
    currentReceipt: any = null;

    constructor(private installmentService: InstallmentService) { }

    ngOnInit() {
        this.loadPlans();
    }

    loadPlans() {
        const filters: any = {};
        if (this.searchPhone) filters.phone = this.searchPhone;
        if (this.searchCNIC) filters.cnic = this.searchCNIC;
        if (this.searchStatus) filters.status = this.searchStatus;

        this.installmentService.getInstallmentPlans(filters).subscribe(data => {
            this.plans = data;
            if (this.selectedPlan) {
                this.selectedPlan = this.plans.find(p => p.id === this.selectedPlan.id);
            }
        });
    }

    resetFilters() {
        this.searchPhone = '';
        this.searchCNIC = '';
        this.searchStatus = '';
        this.loadPlans();
    }

    viewDetails(plan: any) {
        this.selectedPlan = plan;
    }

    getRemaining(plan: any) {
        const totalPaid = plan.installments.reduce((sum: number, i: any) => sum + Number(i.paidAmount), 0);
        return Number(plan.totalAmount) - Number(plan.downPayment) - totalPaid;
    }

    openPayModal(installment: any) {
        this.currentInstallment = installment;
        this.showPayModal = true;
        this.paymentType = 'CASH';
        this.refId = '';
    }

    processPayment() {
        if (this.paymentType === 'ONLINE' && !this.refId) return;

        this.installmentService.payInstallment(
            this.currentInstallment.id,
            this.currentInstallment.amount,
            this.paymentType,
            this.refId
        ).subscribe(() => {
            alert('Payment Successful');
            this.showPayModal = false;
            this.loadPlans();
        });
    }

    printReceipt(plan: any, installment: any) {
        this.currentReceipt = {
            date: installment.paidAt,
            amount: installment.amount,
            type: installment.paymentMethod,
            refId: installment.referenceId,
            instId: installment.id,
            remaining: this.getRemaining(plan)
        };

        // Small delay to ensure template re-renders with new data if needed
        setTimeout(() => {
            const printContent = document.getElementById('thermal-receipt')?.innerHTML;
            const windowUrl = 'About:blank';
            const uniqueName = new Date();
            const windowName = 'Print' + uniqueName.getTime();
            const printWindow = window.open(windowUrl, windowName, 'left=50000,top=50000,width=0,height=0');

            if (printWindow) {
                printWindow.document.write(`
                    <html>
                        <head>
                            <title>Receipt</title>
                            <style>
                                @page { size: 80mm auto; margin: 0; }
                                body { margin: 0; }
                            </style>
                        </head>
                        <body>
                            ${printContent}
                            <script>
                                window.onload = function () {
                                    window.print();
                                };

                                window.onafterprint = function () {
                                    window.close();
                                };
                            <\/script>
                        </body>
                    </html>
                `);
                printWindow.document.close();
                // printWindow.focus();
            }
        }, 100);
    }

    printFullPlan(plan: any) {
        const installmentsHtml = plan.installments.map((inst: any) => `
            <tr>
                <td style="padding: 2mm 0; border-bottom: 1px solid #eee;">${new Date(inst.dueDate).toLocaleDateString()}</td>
                <td style="padding: 2mm 0; border-bottom: 1px solid #eee;">Rs. ${Number(inst.amount).toLocaleString()}</td>
                <td style="padding: 2mm 0; border-bottom: 1px solid #eee; text-align: right;">${inst.status}</td>
            </tr>
        `).join('');

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Installment Plan - ${plan.sale.customer?.name}</title>
                        <style>
                            body { font-family: Arial, sans-serif; padding: 20px; }
                            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                            th { text-align: left; border-bottom: 2px solid #333; padding-bottom: 10px; }
                            .header { text-align: center; margin-bottom: 30px; }
                            .info { margin-bottom: 20px; display: grid; grid-template-columns: 1fr 1fr; }
                        </style>
                    </head>
                    <body>
                        <div class="header">
                            <h1>giftokarachi.com</h1>
                            <h2>Full Installment Plan</h2>
                        </div>
                        <div class="info">
                            <div>
                                <p><strong>Customer:</strong> ${plan.sale.customer?.name}</p>
                                <p><strong>Phone:</strong> ${plan.sale.customer?.phone}</p>
                            </div>
                            <div style="text-align: right;">
                                <p><strong>Plan ID:</strong> ${plan.id}</p>
                                <p><strong>Start Date:</strong> ${new Date(plan.startDate).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <p><strong>Total Amount:</strong> Rs. ${Number(plan.totalAmount).toLocaleString()}</p>
                        <p><strong>Monthly Installment:</strong> Rs. ${Number(plan.monthlyInstallment).toLocaleString()}</p>
                        
                        <table>
                            <thead>
                                <tr>
                                    <th>Due Date</th>
                                    <th>Amount</th>
                                    <th style="text-align: right;">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${installmentsHtml}
                            </tbody>
                        </table>
                        
                        <div style="margin-top: 40px; text-align: center; color: #666; font-size: 12px;">
                            <p>Printed on ${new Date().toLocaleString()}</p>
                        </div>
                        
                       <script>
                            window.onload = function () {
                                window.print();
                            };

                            window.onafterprint = function () {
                                window.close();
                            };
                        <\/script>
                    </body>
                </html>
            `);
            printWindow.document.close();
        }
    }
}
