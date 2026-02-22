import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
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
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
        <h2>Purchase Management</h2>
        <div>
            <button class="btn btn-secondary" style="margin-right: 0.5rem;" (click)="showSupplierForm = !showSupplierForm">Add Supplier</button>
            <button class="btn btn-primary" (click)="toggleForm()">New Purchase</button>
        </div>
      </div>

      <!-- Supplier Form -->
      <div *ngIf="showSupplierForm" class="card" style="margin-bottom: 1rem;">
        <h3>New Supplier</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <input type="text" class="form-control" [(ngModel)]="newSupplier.name" placeholder="Supplier Name">
            <input type="text" class="form-control" [(ngModel)]="newSupplier.phone" placeholder="Phone">
        </div>
        <button class="btn btn-primary" style="margin-top: 0.5rem;" (click)="addSupplier()">Save Supplier</button>
      </div>

      <!-- Add Purchase Form -->
      <div *ngIf="showForm" class="card" style="margin-bottom: 2rem;">
        <h3>New Purchase</h3>
        <form [formGroup]="purchaseForm" (ngSubmit)="onSubmit()">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div class="form-group">
                    <label class="form-label">Supplier</label>
                    <select class="form-control" formControlName="supplierId">
                        <option *ngFor="let s of suppliers" [value]="s.id">{{ s.name }}</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Shop</label>
                    <select class="form-control" formControlName="shopId" >
                        <option *ngFor="let shop of shops" [value]="shop.id">{{ shop.name }}</option>
                    </select>
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
      <div class="card">
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="text-align: left; border-bottom: 1px solid var(--border-color);">
                    <th style="padding: 1rem;">Invoice #</th>
                    <th style="padding: 1rem;">Supplier</th>
                    <th style="padding: 1rem;">Total</th>
                    <th style="padding: 1rem;">Paid</th>
                    <th style="padding: 1rem;">Balance</th>
                    <th style="padding: 1rem;">Date</th>
                </tr>
            </thead>
            <tbody>
                <tr *ngFor="let p of purchases" style="border-bottom: 1px solid var(--border-color);">
                    <td style="padding: 1rem;">{{ p.invoiceNo }}</td>
                    <td style="padding: 1rem;">{{ p.supplier?.name }}</td>
                    <td style="padding: 1rem;">Rs. {{ p.totalAmount | number:'1.2-2' }}</td>
                    <td style="padding: 1rem;">Rs. {{ p.paidAmount | number:'1.2-2' }}</td>
                    <td style="padding: 1rem;">Rs. {{ p.balance | number:'1.2-2' }}</td>
                    <td style="padding: 1rem;">{{ p.createdAt | date:'short' }}</td>
                </tr>
            </tbody>
        </table>
      </div>
    </div>
  `,
    styles: [`
    .btn-secondary { background: var(--secondary); color: white; }
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
    newSupplier = { name: '', phone: '' };

    purchaseItems: any[] = [];
    currentItem = { productId: null, quantity: 1, costPrice: 0 };

    constructor(
        private purchaseService: PurchaseService,
        private productService: ProductService,
        private shopService: ShopService,
        private authService: AuthService,
        private fb: FormBuilder
    ) {
        console.log('Current User:', this.user);
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
        this.purchaseService.getAllPurchases().subscribe(data => this.purchases = data);
        this.purchaseService.getAllSuppliers().subscribe(data => this.suppliers = data);
        this.productService.getAllProducts().subscribe(data => this.products = data);
        this.shopService.getAllShops().subscribe(data => this.shops = data);
    }

    toggleForm() {
        this.showForm = !this.showForm;
    }

    addSupplier() {
        if (!this.newSupplier.name) return;
        this.purchaseService.createSupplier(this.newSupplier).subscribe(() => {
            this.loadData();
            this.showSupplierForm = false;
            this.newSupplier = { name: '', phone: '' };
        });
    }

    addItem() {
        if (!this.currentItem.productId || this.currentItem.quantity <= 0) return;
        this.purchaseItems.push({ ...this.currentItem, productId: Number(this.currentItem.productId)});
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
        if (this.purchaseForm.invalid || this.purchaseItems.length === 0) return;

        const data = {
            ...this.purchaseForm.value,
            shopId:  this.user?.role !== 'SUPER_ADMIN' ? this.user.shopId : Number(this.purchaseForm.value.shopId),
            supplierId : Number(this.purchaseForm.value.supplierId),
            totalAmount: this.calculateTotal(),
            userId: this.authService.getCurrentUser()?.id,
            items: this.purchaseItems
        };

        this.purchaseService.createPurchase(data).subscribe(() => {
            this.loadData();
            this.toggleForm();
            this.purchaseForm.reset();
            this.purchaseItems = [];
        });
    }
}
