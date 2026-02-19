import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { SalesService } from '../../services/sales.service';
import { AuthService } from '../../services/auth.service';
import { CustomerService } from '../../services/customer.service';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-pos',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormsModule],
    template: `
    <div class="container" style="padding-top: 2rem; display: grid; grid-template-columns: 2fr 1fr; gap: 2rem;">
      <!-- Product Selection -->
      <div class="card">
        <h2>Products</h2>
        <div style="margin-bottom: 1rem;">
            <input type="text" class="form-control" placeholder="Search product..." (input)="filterProducts($event)">
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 1rem;">
            <div *ngFor="let product of filteredProducts" class="card" (click)="addToCart(product)" style="cursor: pointer; border: 1px solid var(--border-color);">
                <h4>{{ product.name }}</h4>
                <p>Rs. {{ product.price | number:'1.2-2' }}</p>
                <p style="font-size: 0.8rem; color: var(--text-muted);">Stock: {{ product.stock }}</p>
            </div>
        </div>
      </div>

      <!-- Cart & Checkout -->
      <div class="card">
        <h2>Checkout</h2>
        <div *ngIf="cart.length === 0" style="text-align: center; color: var(--text-muted); margin: 2rem 0;">
            Cart is empty
        </div>
        
        <div *ngFor="let item of cart" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--border-color);">
            <div>
                <div>{{ item.product.name }}</div>
                <div style="font-size: 0.8rem;">{{ item.quantity }} x Rs. {{ item.product.price | number:'1.2-2' }}</div>
            </div>
            <div>
                Rs. {{ (item.quantity * item.product.price) | number:'1.2-2' }}
                <button class="btn btn-danger" style="padding: 0.1rem 0.3rem; margin-left: 0.5rem;" (click)="removeFromCart(item)">X</button>
            </div>
        </div>

        <div style="margin-top: 2rem;">
            <div class="form-group">
                <label class="form-label">Sale Type</label>
                <select class="form-control" [(ngModel)]="saleType">
                    <option value="CASH">CASH</option>
                    <option value="INSTALLMENT">INSTALLMENT</option>
                </select>
            </div>

           
                <div class="form-group">
                    <label class="form-label">Customer</label>
                    <select class="form-control" [(ngModel)]="selectedCustomerId">
                        <option *ngFor="let customer of customers" [value]="customer.id">{{ customer.name }} ({{ customer.phone }})</option>
                    </select>
                </div>
                <div *ngIf="saleType === 'INSTALLMENT'">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div class="form-group">
                        <label class="form-label">Down Payment</label>
                        <input type="number" class="form-control" [(ngModel)]="downPayment">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Duration (Months)</label>
                        <input type="number" class="form-control" [(ngModel)]="duration">
                    </div>
                </div>
            </div>
        </div>

        <div style="margin-top: 2rem; border-top: 2px solid var(--border-color); padding-top: 1rem;">
            <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 1.2rem;">
                <span>Total:</span>
                <span>Rs. {{ total | number:'1.2-2' }}</span>
            </div>
            <div *ngIf="saleType === 'INSTALLMENT'" style="display: flex; justify-content: space-between; font-size: 0.9rem; margin-top: 0.5rem;">
                <span>Remaining:</span>
                <span>Rs. {{ (total - downPayment) | number:'1.2-2' }}</span>
            </div>
        </div>

        <button class="btn btn-primary" style="width: 100%; margin-top: 1rem;" [disabled]="cart.length === 0 || (saleType === 'INSTALLMENT' && !selectedCustomerId)" (click)="checkout()">
            Complete {{ saleType }} Sale
        </button>
      </div>
    </div>
  `
})
export class PosComponent implements OnInit {
    products: any[] = [];
    filteredProducts: any[] = [];
    customers: any[] = [];
    cart: any[] = [];
    user: any;

    saleType: 'CASH' | 'INSTALLMENT' = 'CASH';
    selectedCustomerId: number | null = null;
    downPayment: number = 0;
    duration: number = 6;

    constructor(
        private productService: ProductService,
        private salesService: SalesService,
        private authService: AuthService,
        private customerService: CustomerService,
        private fb: FormBuilder
    ) { }

    ngOnInit() {
        this.productService.getAllProducts().subscribe(data => {
            this.products = data;
            this.filteredProducts = data;
        });
        this.customerService.getAllCustomers().subscribe(data => this.customers = data);
        this.authService.currentUser$.subscribe(u => this.user = u);
    }

    filterProducts(event: any) {
        const query = event.target.value.toLowerCase();
        this.filteredProducts = this.products.filter(p => p.name.toLowerCase().includes(query) || (p.sku && p.sku.toLowerCase().includes(query)));
    }

    addToCart(product: any) {
        if (product.stock <= 0) return alert('Out of stock!');

        const existing = this.cart.find(item => item.product.id === product.id);
        if (existing) {
            if (existing.quantity >= product.stock) return alert('No more stock!');
            existing.quantity++;
        } else {
            this.cart.push({ product, quantity: 1 });
        }
    }

    removeFromCart(item: any) {
        this.cart = this.cart.filter(i => i !== item);
    }

    get total() {
        return this.cart.reduce((sum, item) => sum + (item.quantity * item.product.price), 0);
    }

    checkout() {
        if (!this.user) return;

        const saleData: any = {
            shopId: this.user.shopId || 1,
            userId: this.user.id,
            customerId: Number(this.selectedCustomerId),
            paymentMethod: this.saleType === 'CASH' ? 'CASH' : 'MIXED',
            saleType: this.saleType,
            paidAmount: this.saleType === 'CASH' ? this.total : this.downPayment,
            items: this.cart.map(item => ({
                productId: item.product.id,
                quantity: item.quantity,
                price: item.product.price
            }))
        };

        if (this.saleType === 'INSTALLMENT') {
            saleData.downPayment = this.downPayment;
            saleData.duration = this.duration;
        }

        this.salesService.createSale(saleData).subscribe({
            next: () => {
                alert('Sale Completed!');
                this.cart = [];
                this.downPayment = 0;
                this.selectedCustomerId = null;
                this.productService.getAllProducts().subscribe(data => {
                    this.products = data;
                    this.filteredProducts = data;
                });
            },
            error: (err) => alert('Sale Failed: ' + err.message)
        });
    }
}
