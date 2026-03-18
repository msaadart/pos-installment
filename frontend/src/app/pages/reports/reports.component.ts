import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../services/report.service';

@Component({
    selector: 'app-reports',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './reports.component.html',
    styleUrls: ['./reports.component.css']
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
  
        const content = document.getElementById(this.activeTab);
        if (!content) return;

        const printWindow = window.open('', '_blank');
        if (printWindow) {

            printWindow.document.write(`
            <html>
                <head>
                    <title>${this.activeTab} Report</title>
                    <style>
                         @page { size: 80mm auto; margin: 0; }
                              body { font-family: Arial, sans-serif; padding: 20px; }
                            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                            th { text-align: left; border-bottom: 2px solid #333; padding-bottom: 10px; }
                        th, td { background-color: #fff; font-size: 14px; }
                        h2 { text-align: center; text-transform: uppercase; }
                        span { font-size: 10px; }
                    </style>
                </head>
                <body>
                    <h2>${this.activeTab} Report</h2>
                    ${content.outerHTML}
                </body>
            </html>
            <script>
                window.onload = function () {
                    window.print();
                };

                window.onafterprint = function () {
                    window.close();
                };
            <\/script>
        `);
            printWindow.document.close();
        }
    
    }

    trackByFn(index:number, item:any) {
        return item.id;
    }
}
