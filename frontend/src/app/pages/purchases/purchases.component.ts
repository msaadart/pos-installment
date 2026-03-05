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
    templateUrl: './purchases.component.html',
    styleUrls: ['./purchases.component.css']
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

    searchPayments() {
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
