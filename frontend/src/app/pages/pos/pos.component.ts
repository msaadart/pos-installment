import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { SalesService } from '../../services/sales.service';
import { AuthService } from '../../services/auth.service';
import { CustomerService } from '../../services/customer.service';
import { ShopService } from '../../services/shop.service';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { NgOptimizedImage } from '@angular/common';
import { environment } from '../../../environments/environment.development';

@Component({
    selector: 'app-pos',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormsModule, NgOptimizedImage],
    template: `
    <div class="container" style="padding-top: 2rem; display: grid; grid-template-columns: 2fr 1fr; gap: 2rem;">
      <!-- Product Selection -->
      <div class="card">
        <h2>Products</h2>
        <div style="margin-bottom: 1rem;">
            <input type="text" class="form-control" placeholder="Search product..." (input)="filterProducts($event)">
        </div>
        @defer{
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 1rem;">
            <div *ngFor="let product of filteredProducts" class="card" (click)="addToCart(product)" style="cursor: pointer; border: 1px solid var(--border-color); padding: 0.5rem;">
            <img [ngSrc]="product.imageUrl ? apiUrl + product.imageUrl : 'assets/placeholder.png'" [alt]="product.name" width="100" height="100" style="width: 100%; height: 100px; object-fit: cover; border-bottom: 1px solid var(--border-color);">    
            <h4>{{ product.name }}</h4>
                <p>Rs. {{ product.price | number:'1.2-2' }}</p>
                <p style="font-size: 0.8rem; color: var(--text-muted);">Stock: {{ product.stock }}</p>
            </div>
        </div>
        }@placeholder{
            <div style="text-align: center; color: var(--text-muted); margin: 2rem 0;">
                Loading products...
            </div>
        }
      </div>

      <!-- Cart & Checkout -->
      <div class="card">
        <h2>Checkout</h2>
        <div *ngIf="cart.length === 0" style="text-align: center; color: var(--text-muted); margin: 2rem 0;">
            Cart is empty
        </div>
        
        <div *ngFor="let item of cart; let i = index" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--border-color);">
            <div style="flex-grow: 1;">
                <div>{{ item.productName }}</div>
                <div style="font-size: 0.8rem;">{{ item.quantity }} x 
                    <input type="number" [(ngModel)]="item.price" style="width: 80px; padding: 2px; border: 1px solid var(--border-color); border-radius: 4px;">
                </div>
            </div>
            <div style="display: flex; align-items: center;">
                Rs. {{ (item.quantity * item.price) | number:'1.2-2' }}
                <button class="btn btn-danger" style="padding: 0.1rem 0.3rem; margin-left: 0.5rem;" (click)="removeFromCart(i)">X</button>
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
                    <select class="form-control" [(ngModel)]="selectedCustomerId" [class.is-invalid]="submitted && !selectedCustomerId">
                        <option *ngFor="let customer of activeCustomers" [value]="customer.id">{{ customer.name }} ({{ customer.phone }})</option>
                    </select>
                    <div class="invalid-feedback" *ngIf="submitted && !selectedCustomerId">
                        Customer is required
                    </div>
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
    activeCustomers: any[] = [];
    cart: any[] = [];
    user: any = this.authService.getCurrentUser();
    submitted = false;
    private toastr = inject<ToastrService>(ToastrService);

    saleType: 'CASH' | 'INSTALLMENT' = 'CASH';
    selectedCustomerId: number | null = null;
    downPayment: number = 0;
    duration: number = 6;
    apiUrl = environment.baseUrl;

    // Added for shop selection, though not used in template yet
    shops: any[] = [];
    saleForm!: FormGroup; // Added saleForm

    constructor(
        private productService: ProductService,
        private salesService: SalesService,
        private authService: AuthService,
        private customerService: CustomerService,
        private fb: FormBuilder,
        private shopService: ShopService // Injected ShopService
    ) {
        // Initialize saleForm here
        this.saleForm = this.fb.group({
            customerId: [null, Validators.required],
            shopId: [null, Validators.required]
        });
    }

    ngOnInit() {
        this.loadInitialData();
        // this.authService.currentUser$.subscribe(u => this.user = u);
    }

    loadInitialData() {
        this.productService.getAllProducts().subscribe(data => {
            this.products = data;
            this.filteredProducts = data;
        });
        this.customerService.getAllCustomers().subscribe(data => {
            this.customers = data;
            this.activeCustomers = data.filter((c: any) => c.isActive);
            if (this.activeCustomers.length === 1) {
                this.selectedCustomerId = this.activeCustomers[0].id;
                this.saleForm.patchValue({ customerId: this.activeCustomers[0].id }); // Patching saleForm as well
            }
        });
        this.shopService.getAllShops().subscribe(data => this.shops = data);

        if (this.user?.role !== 'SUPER_ADMIN') {
            this.saleForm.patchValue({ shopId: this.user.shopId });
            this.saleForm.get('shopId')?.disable();
        }
    }

    filterProducts(event: any) {
        const query = event.target.value.toLowerCase();
        this.filteredProducts = this.products.filter(p => p.name.toLowerCase().includes(query) || (p.sku && p.sku.toLowerCase().includes(query)));
    }

    addToCart(product: any) {
        if (product.stock <= 0) {
            this.toastr.warning('Out of stock!');
            return;
        }

        const existing = this.cart.find(item => item.product.id === product.id);
        if (existing) {
            if (existing.quantity >= product.stock) {
                this.toastr.warning('No more stock!');
                return;
            }
            existing.quantity++;
        } else {
            this.cart.push({
                product,
                quantity: 1,
                price: Number(product.price),
                productName: product.name
            });
        }
    }


    removeFromCart(index: number) {
        this.cart.splice(index, 1);
    }

    get total() {
        return this.cart.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    }

    checkout() {
        this.submitted = true;
        if (!this.selectedCustomerId || this.cart.length === 0) {
            if (this.cart.length === 0) {
                this.toastr.warning('Your cart is empty');
            }
            return;
        }

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
                price: item.price
            }))
        };

        if (this.saleType === 'INSTALLMENT') {
            saleData.downPayment = this.downPayment;
            saleData.duration = this.duration;
        }

        this.salesService.createSale(saleData).subscribe({
            next: () => {
                this.toastr.success('Sale Completed!');
                this.cart = [];
                this.downPayment = 0;
                this.selectedCustomerId = null;
                this.submitted = false;
                this.productService.getAllProducts().subscribe(data => {
                    this.products = data;
                    this.filteredProducts = data;
                });
            },
            error: (err) => {
                // errorInterceptor will handle showing the toaster
            }
        });
    }
}
