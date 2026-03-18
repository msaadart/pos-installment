import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InstallmentService } from '../../services/installment.service';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-installments',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './installments.component.html',
    styleUrls: ['./installments.component.css']
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
                this.selectedPlan = this.plans.find((p: any) => p.id === this.selectedPlan.id);
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
                                 body { font-family: Arial, sans-serif; padding: 20px; }
                               

                                #thermal-receipt {
                                    display: block !important;
                                    position: absolute;
                                    left: 0;
                                    top: 0;
                                    width: 80mm; /* thermal printer width */
                                    font-family: monospace;
                                    font-size: 12px;
                                }

                                .receipt-wrapper {
                                    width: 100%;
                                    padding: 5px;
                                }

                                .receipt-header {
                                    text-align: center;
                                    border-bottom: 1px dashed #000;
                                    margin-bottom: 5px;
                                }

                                .receipt-header h2 {
                                    font-size: 16px;
                                    margin: 0;
                                }

                                .receipt-info p {
                                    margin: 2px 0;
                                }

                                .receipt-table {
                                    width: 100%;
                                    border-top: 1px dashed #000;
                                    border-bottom: 1px dashed #000;
                                    margin-top: 5px;
                                }

                                .receipt-table td {
                                    padding: 2px 0;
                                }

                                .text-right {
                                    text-align: right;
                                }

                                .receipt-balance {
                                    margin-top: 5px;
                                    font-weight: bold;
                                }

                                .receipt-footer {
                                    text-align: center;
                                    margin-top: 8px;
                                    border-top: 1px dashed #000;
                                    padding-top: 5px;
                                }

                                .receipt-time {
                                    font-size: 10px;
                                }
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
                            .info { margin-bottom: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
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

    trackByFn(index:number, item:any) {
        return item.id;
    }
}
