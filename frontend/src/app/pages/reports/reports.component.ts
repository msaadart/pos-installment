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
       setTimeout(() => {
            window.print();
        }, 300);
    }
}
