import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { SalesService } from '../../services/sales.service';
import { AuthService } from '../../services/auth.service';
import { CustomerService } from '../../services/customer.service';
import { ShopService } from '../../services/shop.service';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-pos',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormsModule, NgOptimizedImage],
    templateUrl: './pos.component.html',
    styleUrls: ['./pos.component.css']
})
export class PosComponent implements OnInit {
    products: any[] = [];
    filteredProducts: any[] = [];
    customers: any[] = [];
    activeCustomers: any[] = [];
    filteredCustomerOptions: any[] = [];
    cart: any[] = [];
    user: any = this.authService.getCurrentUser();
    submitted = false;
    private toastr = inject<ToastrService>(ToastrService);

    saleType: 'CASH' | 'INSTALLMENT' = 'CASH';
    selectedCustomerId: number | null = null;
    customerSearch = '';
    showCustomerList = false;
    downPayment: number = 0;
    duration: number = 6;
    paymentMethod: 'CASH' | 'ONLINE' | 'MIXED' | 'BANK_TRANSFER' = 'CASH';
    referenceId: string = '';
    apiUrl = environment.baseUrl;

    shops: any[] = [];
    saleForm!: FormGroup;

    constructor(
        private productService: ProductService,
        private salesService: SalesService,
        private authService: AuthService,
        private customerService: CustomerService,
        private fb: FormBuilder,
        private shopService: ShopService
    ) {
        this.saleForm = this.fb.group({
            customerId: [null, Validators.required],
            shopId: [null, Validators.required]
        });
    }

    ngOnInit() {
        this.loadInitialData();
    }

    loadInitialData() {
        this.productService.getAllProducts().subscribe(data => {
            this.products = data;
            this.filteredProducts = data;
        });
        this.customerSearchChange();
        this.shopService.getAllShops().subscribe(data => this.shops = data);

        if (this.user?.role !== 'SUPER_ADMIN') {
            this.saleForm.patchValue({ shopId: this.user.shopId });
            this.saleForm.get('shopId')?.disable();
        }
    }

    customerSearchChange(cnic?: string) {
        this.customerService.getAllCustomers({search:cnic?cnic:''}).subscribe(data => {
            this.customers = data;
            this.activeCustomers = data.filter((c: any) => c.isActive);
            this.filteredCustomerOptions = this.activeCustomers;

            if (this.activeCustomers.length === 1) {
                const soleCustomer = this.activeCustomers[0];
                this.selectedCustomerId = soleCustomer.id;
                this.customerSearch = `${soleCustomer.name} (${soleCustomer.cnic})`;
                this.saleForm.patchValue({ customerId: soleCustomer.id });
            }
        });
    }

    filterProducts(event: any) {
        const query = event.target.value.toLowerCase();
        this.filteredProducts = this.products.filter(p => p.name.toLowerCase().includes(query) || (p.sku && p.sku.toLowerCase().includes(query)));
    }

    filterCustomers(query: string) {
        const normalized = (query || '').toLowerCase().trim();
        if (!normalized) {
            this.filteredCustomerOptions = this.activeCustomers;
            this.selectedCustomerId = null;
            this.saleForm.patchValue({ customerId: null });
            return;
        }

        this.filteredCustomerOptions = this.activeCustomers.filter(c =>
            (c.name || '').toLowerCase().includes(normalized) ||
            (c.cnic || '').toLowerCase().includes(normalized)
        );

        // Clear selection when typing
        this.selectedCustomerId = null;
        this.saleForm.patchValue({ customerId: null });
    }

    selectCustomer(customer: any) {
        this.selectedCustomerId = customer.id;
        this.customerSearch = `${customer.name} (${customer.cnic})`;
        this.saleForm.patchValue({ customerId: customer.id });
        this.showCustomerList = false;
    }

    hideCustomerList() {
        // Delay hiding so clicks on list items still register
        setTimeout(() => this.showCustomerList = false, 150);
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
            paymentMethod: this.paymentMethod,
            saleType: this.saleType,
            paidAmount: this.saleType === 'CASH' ? this.total : this.downPayment,
            referenceId: this.referenceId,
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
                this.customerSearch = '';
                this.referenceId = '';
                this.saleType = 'CASH';
                this.submitted = false;
                this.productService.getAllProducts().subscribe(data => {
                    this.products = data;
                    this.filteredProducts = data;
                });
            },
            error: (err) => {
            }
        });
    }

    trackByFn(index:number, item:any) {
        return item.id;
    }
}
