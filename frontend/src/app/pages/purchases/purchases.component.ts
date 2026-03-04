import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { PurchaseService } from '../../services/purchase.service';
import { ProductService } from '../../services/product.service';
import { ShopService } from '../../services/shop.service';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-purchases',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormsModule],
    template: `
    <div class="container" style="padding-top: 2rem;">
      <div style="display: flex; gap: 1rem; margin-bottom: 2rem; align-items: center;">
        <h2 style="margin: 0;">Purchases</h2>
        <div style="margin-left: auto; display: flex; gap: 0.5rem;">
         <button class="btn btn-secondary" style="margin-right: 0.5rem;" (click)="showSupplierForm = !showSupplierForm">Add Supplier</button>
         <button class="btn btn-primary" (click)="toggleForm()">New Purchase</button>
        </div>
        </div>

      <!-- Supplier Form -->
      <div *ngIf="showSupplierForm" class="card">
        <h3>New Supplier</h3>
        <div  style="display: flex; gap: 1rem; margin-bottom: 1rem; align-items: center;">
            <input type="text" class="form-control" [(ngModel)]="newSupplier.name" placeholder="Supplier Name">
            <input type="text" class="form-control" [(ngModel)]="newSupplier.phone" placeholder="Phone">
            <input type="text" class="form-control" [(ngModel)]="newSupplier.company" placeholder="company">
            <button class="btn btn-primary" (click)="addSupplier()">Save</button>
        </div>
        
      </div>

      <!-- Add Purchase Form -->
      <div *ngIf="showForm" class="card" style="margin-bottom: 2rem;">
        <h3>New Purchase</h3>
        <form [formGroup]="purchaseForm" (ngSubmit)="onSubmit()">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div class="form-group">
                    <label class="form-label">Supplier</label>
                    <select class="form-control" formControlName="supplierId" [class.is-invalid]="purchaseForm.get('supplierId')?.invalid && purchaseForm.get('supplierId')?.touched">
                        <option *ngFor="let s of suppliers" [value]="s.id">{{ s.name }} (Bal: Rs. {{s.balance}})</option>
                    </select>
                    <div class="invalid-feedback" *ngIf="purchaseForm.get('supplierId')?.invalid && purchaseForm.get('supplierId')?.touched">
                        Supplier is required
                    </div>
                </div>
                
                <!--<div *ngIf="purchaseForm.get('supplierId')?.value" style="display: flex; align-items: flex-end; margin-bottom: 1rem;">
                    <button type="button" class="btn btn-warning" (click)="clearBalance()" *ngIf="getSelectedSupplierBalance() > 0">Clear Supplier Balance</button>
                </div>-->
                
                <div class="form-group">
                    <label class="form-label">Shop (Destination)</label>
                    <select class="form-control" formControlName="shopId" [class.is-invalid]="purchaseForm.get('shopId')?.invalid && purchaseForm.get('shopId')?.touched">
                        <option *ngFor="let shop of shops" [value]="shop.id">{{ shop.name }}</option>
                    </select>
                    <div class="invalid-feedback" *ngIf="purchaseForm.get('shopId')?.invalid && purchaseForm.get('shopId')?.touched">
                        Shop is required
                    </div>
                </div>
                
            </div>

            <h4>Items</h4>
            <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 0.5fr; gap: 0.5rem; margin-bottom: 1rem;">
                <select class="form-control" [(ngModel)]="currentItem.productId" [ngModelOptions]="{standalone: true}">
                    <option *ngFor="let p of products" [value]="p.id">{{ p.name }} (Stock: {{p.stock}})</option>
                </select>
                <input type="number" class="form-control" [(ngModel)]="currentItem.quantity" [ngModelOptions]="{standalone: true}" placeholder="Qty">
                <input type="number" class="form-control" [(ngModel)]="currentItem.costPrice" [ngModelOptions]="{standalone: true}" placeholder="Cost">
                <button type="button" class="btn btn-secondary" (click)="addItem()">Add</button>
            </div>

            <table *ngIf="purchaseItems.length > 0" style="width: 100%; margin-bottom: 1rem;">
                <thead>
                    <tr style="text-align: left;">
                        <th>Product</th>
                        <th>Qty</th>
                        <th>Cost</th>
                        <th>Subtotal</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <tr *ngFor="let item of purchaseItems; let i = index">
                        <td>{{ getProductName(item.productId) }}</td>
                        <td>{{ item.quantity }}</td>
                        <td>Rs. {{ item.costPrice | number:'1.2-2' }}</td>
                        <td>Rs. {{ (item.quantity * item.costPrice) | number:'1.2-2' }}</td>
                        <td><button type="button" class="btn" style="color: red;" (click)="removeItem(i)">×</button></td>
                    </tr>
                </tbody>
            </table>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem;">
                <div class="form-group">
                    <label class="form-label">Total Amount</label>
                    <input type="number" class="form-control" [value]="calculateTotal()" readonly>
                </div>
                <div class="form-group">
                    <label class="form-label">Paid Amount</label>
                    <input type="number" class="form-control" formControlName="paidAmount">
                </div>
            </div>

            <button type="submit" class="btn btn-primary" [disabled]="purchaseForm.invalid || purchaseItems.length === 0">Create Purchase</button>
            
        </form>
      </div>

      <!-- Purchase List -->
      <div class="card" style="margin-top: 1rem;">
      <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
        <input type="text" class="form-control" [(ngModel)]="searchTerm" placeholder="Search purchases by invoice or supplier...">
        <button class="btn btn-primary" (click)="onSearch()">Search</button>
        </div>
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="text-align: left; border-bottom: 1px solid var(--border-color);">
                    <th style="padding: 1rem;">Invoice #</th>
                    <th style="padding: 1rem;">Supplier</th>
                    <th style="padding: 1rem;">Phone</th>
                    <th style="padding: 1rem;">Total</th>
                    <th style="padding: 1rem;">Paid</th>
                    <th style="padding: 1rem;">Balance</th>
                    <th style="padding: 1rem;">Date</th>
                </tr>
            </thead>
            <tbody>
                <tr *ngFor="let p of purchases" style="border-bottom: 1px solid var(--border-color);">
                    <td style="padding: 1rem;">{{ p.invoiceNo }}</td>
                    <td style="padding: 1rem;">{{ p.supplier?.name }}  <small>{{ p.supplier?.company }}</small></td>
                    <td style="padding: 1rem;">{{ p.supplier?.phone }}</td>
                    <td style="padding: 1rem;">Rs. {{ p.totalAmount | number:'1.2-2' }}</td>
                    <td style="padding: 1rem;">Rs. {{ p.paidAmount | number:'1.2-2' }}</td>
                    <td style="padding: 1rem;">Rs. {{ p.balance | number:'1.2-2' }}</td>
                    <td style="padding: 1rem;">{{ p.createdAt | date:'short' }}</td>
                </tr>
            </tbody>
        </table>
      </div>

      <!-- Clear Balance Section -->
      <div class="card" style="margin-top: 2rem;">
        <h3>Clear Remaining Amount</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; align-items: end;">
            <div class="form-group">
                <label class="form-label">Select Supplier</label>
                <select class="form-control" [(ngModel)]="clearBalSupplierId" (change)="onClearBalSupplierChange()">
                    <option *ngFor="let s of suppliers" [value]="s.id">{{ s.name }} (Bal: Rs. {{s.balance}})</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Select Purchase</label>
                <select class="form-control" [(ngModel)]="clearBalPurchaseId" >
                    <option *ngFor="let p of filteredPurchasesForClearBal" [value]="p.id">Inv: {{ p.invoiceNo }} (Bal: Rs. {{p.balance}})</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Clear Amount</label>
                <input type="number" class="form-control" [(ngModel)]="clearBalAmount">
            </div>
            <div class="form-group">
                <label class="form-label">Payment Type</label>
                <select class="form-control" [(ngModel)]="method">
                    <option value="CASH">CASH</option>
                    <option value="ONLINE">ONLINE</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Notes</label>
                <input type="text" class="form-control" [(ngModel)]="notes" placeholder="Payment notes...">
            </div>
        </div>
        <button class="btn btn-primary" style="margin-top: 1rem;" (click)="submitClearPurchaseBalance()">Submit Payment</button>
        <button type="button" class="btn btn-secondary" style="margin-left: 1rem;" (click)="searchPayments()">Search Payment</button>
        <button type="button" class="btn btn-tertiary" style="margin-left: 1rem;" (click)="loadPurchasePayments()">Clear</button>
      </div>

      <!-- Payment History Table (Phase 13) -->
      <div class="card" style="margin-top: 2rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <h3>Payment Clearing History</h3>
            <button class="btn btn-secondary" (click)="printHistory()">Print History</button>
        </div>
        <table id="payment-history-table" style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="text-align: left; border-bottom: 1px solid var(--border-color);">
                    <th style="padding: 1rem;">Supplier</th>
                    <th style="padding: 1rem;">Invoice #</th>
                    <th style="padding: 1rem;">Amount</th>
                    <th style="padding: 1rem;">Method</th>
                    <th style="padding: 1rem;">Date</th>
                    <th style="padding: 1rem;">Notes</th>
                </tr>
            </thead>
            <tbody>
                <tr *ngFor="let pay of purchasePayments" style="border-bottom: 1px solid var(--border-color);">
                    <td style="padding: 1rem;">{{ pay.supplier?.name }}</td>
                    <td style="padding: 1rem;">{{ pay.purchase?.invoiceNo || '-' }}</td>
                    <td style="padding: 1rem;">Rs. {{ pay.amount | number:'1.2-2' }}</td>
                    <td style="padding: 1rem;">{{ pay.method }}</td>
                    <td style="padding: 1rem;">{{ pay.paymentDate | date:'short' }}</td>
                    <td style="padding: 1rem;">{{ pay.notes }}</td>
                </tr>
            </tbody>
        </table>
      </div>
    </div>
  `,
    styles: [`
    .btn-secondary { background: var(--secondary); color: white; }
    .btn-tertiary { background: var(--text-muted); color: white; }
  `]
})
export class PurchasesComponent implements OnInit {
    purchases: any[] = [];
    suppliers: any[] = [];
    products: any[] = [];
    shops: any[] = [];
    user: any = this.authService.getCurrentUser();

    purchaseForm: FormGroup;
    showForm = false;
    showSupplierForm = false;
    private toastr = inject<ToastrService>(ToastrService);
    newSupplier = { name: '', phone: '', company: '' };

    // Clear Balance State
    clearBalSupplierId: number | null = null;
    clearBalPurchaseId: number | null = null;
    clearBalAmount: number = 0;
    method: string = 'CASH';
    notes: string = '';
    filteredPurchasesForClearBal: any[] = [];

    searchTerm = '';
    purchasePayments: any[] = [];

    purchaseItems: any[] = [];
    currentItem = { productId: null, quantity: 1, costPrice: 0 };

    constructor(
        private purchaseService: PurchaseService,
        private productService: ProductService,
        private shopService: ShopService,
        private authService: AuthService,
        private fb: FormBuilder
    ) {
        this.purchaseForm = this.fb.group({
            supplierId: [null, Validators.required],
            shopId: [null, Validators.required],
            paidAmount: [0, Validators.required]
        });
    }

    ngOnInit() {
        this.loadData();
        if (this.user?.role !== 'SUPER_ADMIN') {
            this.purchaseForm.patchValue({ shopId: this.user.shopId });
            this.purchaseForm.get('shopId')?.disable();
        } else {
            this.purchaseForm.get('shopId')?.enable();
        }
    }

    loadData() {
        const filters = this.searchTerm ? { search: this.searchTerm } : {};
        this.purchaseService.getAllPurchases(filters).subscribe(data => this.purchases = data);
        this.purchaseService.getAllSuppliers().subscribe(data => this.suppliers = data);
        this.productService.getAllProducts().subscribe(data => this.products = data);
        this.shopService.getAllShops().subscribe(data => this.shops = data);
        this.loadPurchasePayments();
    }

    onSearch() {
        this.loadData();
    }

    searchPayments(){
        this.loadPurchasePayments({ purchaseId: this.clearBalPurchaseId });
    }

    loadPurchasePayments(filters: any = {}) {
        this.purchaseService.getAllPurchasePayments(filters).subscribe(data => this.purchasePayments = data);
    }

    toggleForm() {
        this.showForm = !this.showForm;
    }

    addSupplier() {
        if (!this.newSupplier.name) return;
        this.purchaseService.createSupplier(this.newSupplier).subscribe(() => {
            this.toastr.success('Supplier added successfully');
            this.loadData();
            this.showSupplierForm = false;
            this.newSupplier = { name: '', phone: '', company: '' };
        });
    }

    getSelectedSupplierBalance() {
        const id = this.purchaseForm.get('supplierId')?.value;
        return this.suppliers.find(s => s.id == id)?.balance || 0;
    }

    clearBalance() {
        const id = this.purchaseForm.get('supplierId')?.value;
        if (!id) return;
        if (confirm('Are you sure you want to clear the entire balance for this supplier?')) {
            this.purchaseService.clearSupplierBalance(Number(id)).subscribe(() => {
                this.toastr.success('Supplier balance cleared');
                this.loadData();
            });
        }
    }

    onClearBalSupplierChange() {
        if (!this.clearBalSupplierId) return;
        this.purchaseService.getAllPurchases({ supplierId: Number(this.clearBalSupplierId) }).subscribe(data => {
            this.filteredPurchasesForClearBal = data.filter((p: any) => Number(p.balance) > 0);
        });
    }

    submitClearPurchaseBalance() {
        if (!this.clearBalPurchaseId || !this.clearBalAmount) {
            this.toastr.error('Please select a purchase and supplier and enter an amount to clear');
            return;
        }
        const selectedPurchase = this.purchases.find(p => p.id == this.clearBalPurchaseId);

        if (!selectedPurchase) {
            this.toastr.error('Invalid purchase selected');
            return;
        }

        //  Prevent negative or zero
        if (this.clearBalAmount <= 0) {
            this.toastr.error('Clear amount must be greater than 0');
            return;
        }

        //  Prevent negative numbers explicitly
        if (this.clearBalAmount < 0) {
            this.toastr.error('Negative values are not allowed');
            return;
        }

        //  Prevent more than balance
        if (this.clearBalAmount > selectedPurchase.balance) {
            this.toastr.error('Clear amount must be less than or equal to the purchase balance');
            return;
        }
        this.purchaseService.clearPurchaseBalance(Number(this.clearBalPurchaseId), this.clearBalAmount, this.method, this.notes).subscribe(() => {
            this.toastr.success('Purchase balance updated successfully');
            this.clearBalAmount = 0;
            this.clearBalPurchaseId = null;
            this.method = 'CASH';
            this.notes = '';
            this.loadData();
        });
    }

    addItem() {
        if (!this.currentItem.productId || this.currentItem.quantity <= 0) return;
        this.purchaseItems.push({ ...this.currentItem, productId: Number(this.currentItem.productId) });
        this.currentItem = { productId: null, quantity: 1, costPrice: 0 };
    }

    removeItem(index: number) {
        this.purchaseItems.splice(index, 1);
    }

    calculateTotal() {
        return this.purchaseItems.reduce((acc, item) => acc + (item.quantity * item.costPrice), 0);
    }

    getProductName(id: any) {
        return this.products.find(p => p.id == id)?.name || 'Unknown';
    }

    onSubmit() {
        if (this.purchaseForm.invalid || this.purchaseItems.length === 0) {
            this.purchaseForm.markAllAsTouched();
            if (this.purchaseItems.length === 0) {
                this.toastr.warning('Please add at least one item');
            }
            return;
        }

        const data = {
            ...this.purchaseForm.value,
            shopId: this.user?.role !== 'SUPER_ADMIN' ? this.user.shopId : Number(this.purchaseForm.value.shopId),
            supplierId: Number(this.purchaseForm.value.supplierId),
            totalAmount: this.calculateTotal(),
            userId: this.authService.getCurrentUser()?.id,
            items: this.purchaseItems
        };

        this.purchaseService.createPurchase(data).subscribe(() => {
            this.toastr.success('Purchase created successfully');
            this.loadData();
            this.toggleForm();
            this.purchaseForm.reset();
            this.purchaseItems = [];
        });
    }

    printHistory() {
        const content = document.getElementById('payment-history-table');
        if (!content) return;

        const printWindow = window.open('', '_blank');
        if (printWindow) {

        printWindow.document.write(`
            <html>
                <head>
                    <title>Payment History</title>
                    <style>
                         @page { size: 80mm auto; margin: 0; }
                              body { font-family: Arial, sans-serif; padding: 20px; }
                            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                            th { text-align: left; border-bottom: 2px solid #333; padding-bottom: 10px; }
                        th, td { background-color: #f2f2f2; font-size: 14px; }
                        h2 { text-align: center; }
                    </style>
                </head>
                <body>
                    <h2>Purchase Payment Clearance History</h2>
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
}
