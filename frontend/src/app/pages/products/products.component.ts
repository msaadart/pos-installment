import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { ShopService } from '../../services/shop.service';
import { environment } from '../../../environments/environment';
import { NgOptimizedImage } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-products',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormsModule, NgOptimizedImage],
    template: `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;"></div>
    <div class="container">
      <div style="display: flex; gap: 1rem;  justify-content: space-between; margin-bottom: 2rem; align-items: center;">
        <h2>Product Management</h2>
        @if(user?.role === 'SUPER_ADMIN' || user?.role === 'SHOP_ADMIN'){
        <div style="display: flex; gap: 0.5rem;">
            <button class="btn btn-secondary" (click)="showCategoryForm = !showCategoryForm">Add Category</button>
            <button class="btn btn-secondary" (click)="showBrandForm = !showBrandForm">Add Brand</button>
            <button class="btn btn-primary" (click)="toggleForm()">New Product</button>
        </div>
    }
      </div>

      <!-- Category Form -->
      <div *ngIf="showCategoryForm" class="card" style="margin-bottom: 1rem;">
        <h3>New Category</h3>
        <input type="text" class="form-control" [(ngModel)]="newCategoryName" placeholder="Category Name">
        <button class="btn btn-primary" style="margin-top: 0.5rem;" (click)="addCategory()">Save</button>
      </div>

      <!-- Brand Form -->
      <div *ngIf="showBrandForm" class="card" style="margin-bottom: 1rem;">
        <h3>New Brand</h3>
        <input type="text" class="form-control" [(ngModel)]="newBrandName" placeholder="Brand Name">
        <button class="btn btn-primary" style="margin-top: 0.5rem;" (click)="addBrand()">Save</button>
      </div>

      <!-- Add Product Form -->
      <div *ngIf="showForm" class="card" style="margin-bottom: 2rem;">
        <h3>{{ isEditing ? 'Edit Product' : 'New Product' }}</h3>
        <form [formGroup]="productForm" (ngSubmit)="onSubmit()">
            <div class="form-group">
                <label class="form-label">Name</label>
                <input type="text" class="form-control" formControlName="name">
            </div>
            <div class="form-group">
                <label class="form-label">SKU</label>
                <input type="text" class="form-control" formControlName="sku">
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div class="form-group">
                    <label class="form-label">Price</label>
                    <input type="number" class="form-control" formControlName="price">
                </div>
                <div class="form-group">
                    <label class="form-label">Cost Price</label>
                    <input type="number" class="form-control" formControlName="costPrice">
                </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div class="form-group">
                    <label class="form-label">Stock</label>
                    <input type="number" class="form-control" formControlName="stock">
                </div>
                <div class="form-group">
                    <label class="form-label">Shop</label>
                    <select class="form-control" formControlName="shopId">
                        <option *ngFor="let shop of shops" [value]="shop.id">{{ shop.name }}</option>
                    </select>
                </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div class="form-group">
                    <label class="form-label">Category</label>
                    <select class="form-control" formControlName="categoryId">
                        <option *ngFor="let cat of categories" [value]="cat.id">{{ cat.name }}</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Brand</label>
                    <select class="form-control" formControlName="brandId">
                        <option *ngFor="let brand of brands" [value]="brand.id">{{ brand.name }}</option>
                    </select>
                </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div class="form-group">
                    <label class="form-label">Barcode</label>
                    <input type="text" class="form-control" formControlName="barcode">
                </div>
                <div class="form-group">
                    <label class="form-label">Description</label>
                    <input type="text" class="form-control" formControlName="description" rows="3">
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">Product Image</label>
                <input type="file" class="form-control" (change)="onFileSelected($event)" accept="image/*">
                <div *ngIf="imagePreview" style="margin-top: 1rem;">
                    <img [src]="imagePreview" style="max-width: 150px; border-radius: 8px;">
                </div>
            </div>

            <div style="display: flex; gap: 1rem;">
                <button type="submit" class="btn btn-primary" [disabled]="productForm.invalid">{{ isEditing ? 'Update' : 'Create' }} Product</button>
                <button type="button" class="btn btn-secondary" (click)="cancelEdit()">Cancel</button>
            </div>
        </form>
      </div>

      <!-- Product List -->
      <div class="card">
      <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
        <input type="text" class="form-control" [(ngModel)]="searchTerm"  placeholder="Search products by name or SKU..." >
        <button class="btn btn-primary" (click)="onSearch()">Search</button>
      </div>
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="text-align: left; border-bottom: 1px solid var(--border-color);">
                    <th style="padding: 1rem;">Photo</th>
                    <th style="padding: 1rem;">Name</th>
                    <th style="padding: 1rem;">SKU</th>
                    <th style="padding: 1rem;">Price</th>
                    <th style="padding: 1rem;">Stock</th>
                    <th style="padding: 1rem;">Category</th>
                    <th style="padding: 1rem;">Brand</th>
                    <th style="padding: 1rem;" *ngIf="['SUPER_ADMIN', 'SHOP_ADMIN'].includes(user?.role)">Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr *ngFor="let product of products" style="border-bottom: 1px solid var(--border-color);">
                    <td style="padding: 1rem;">
                        <img *ngIf="product.imageUrl" [ngSrc]="apiUrl + product.imageUrl" width="50" height="50" style="object-fit: cover; border-radius: 4px;">
                        <span *ngIf="!product.imageUrl">-</span>
                    </td>
                    <td style="padding: 1rem;">{{ product.name }}</td>
                    <td style="padding: 1rem;">{{ product.sku }}</td>
                    <td style="padding: 1rem;">Rs. {{ product.price | number:'1.2-2' }}</td>
                    <td style="padding: 1rem;">{{ product.stock }}</td>
                    <td style="padding: 1rem;">{{ product.category?.name || '-' }}</td>
                    <td style="padding: 1rem;">{{ product.brand?.name || '-' }}</td>
                    <td style="padding: 1rem;" *ngIf="['SUPER_ADMIN', 'SHOP_ADMIN'].includes(user?.role)">
                        <button class="btn btn-secondary" style="padding: 0.2rem 0.5rem; font-size: 0.8rem;" (click)="editProduct(product)">Edit</button>
                    </td>
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
export class ProductsComponent implements OnInit {
    products: any[] = [];
    shops: any[] = [];
    categories: any[] = [];
    brands: any[] = [];
    apiUrl = environment.baseUrl;
    user: any = this.authService.getCurrentUser();


    productForm: FormGroup;
    showForm = false;
    imagePreview: string | null = null;
    selectedFileBase64: string | null = null;

    showCategoryForm = false;
    showBrandForm = false;
    newCategoryName = '';
    newBrandName = '';

    isEditing = false;
    editingProductId: number | null = null;
    searchTerm = '';

    constructor(
        private productService: ProductService,
        private shopService: ShopService,
        private fb: FormBuilder,
        private authService: AuthService,
    ) {
        this.productForm = this.fb.group({
            name: ['', Validators.required],
            sku: ['', Validators.required],
            price: [0, Validators.required],
            costPrice: [0, Validators.required],
            stock: [0, Validators.required],
            shopId: [Number, Validators.required],
            categoryId: [Number],
            brandId: [Number],
            barcode: ['', Validators.required],
            description: ['']
        });
    }

    ngOnInit() {
        this.loadData();
        if (this.user?.role !== 'SUPER_ADMIN') {
            this.productForm.patchValue({ shopId: this.user.shopId });
            this.productForm.get('shopId')?.disable();
        } else {
            this.productForm.get('shopId')?.enable();
        }
    }

    loadData() {
        const filters = this.searchTerm ? { search: this.searchTerm } : {};
        this.productService.getAllProducts(filters).subscribe(data => this.products = data);
        this.shopService.getAllShops().subscribe(data => this.shops = data);
        this.productService.getAllCategories().subscribe(data => this.categories = data);
        this.productService.getAllBrands().subscribe(data => this.brands = data);
    }

    onSearch() {
        this.loadData();
    }

    toggleForm() {
        this.showForm = !this.showForm;
    }

    addCategory() {
        if (!this.newCategoryName) return;
        this.productService.createCategory({ name: this.newCategoryName }).subscribe(() => {
            this.loadData();
            this.showCategoryForm = false;
            this.newCategoryName = '';
        });
    }

    addBrand() {
        if (!this.newBrandName) return;
        this.productService.createBrand({ name: this.newBrandName }).subscribe(() => {
            this.loadData();
            this.showBrandForm = false;
            this.newBrandName = '';
        });
    }

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                this.imagePreview = reader.result as string;
                this.selectedFileBase64 = reader.result as string;
            };
            reader.readAsDataURL(file);
        }
    }

    onSubmit() {
        if (this.productForm.invalid) return;

        const productData = {
            ...this.productForm.value,
            shopId: this.user?.role !== 'SUPER_ADMIN' ? this.user.shopId : Number(this.productForm.value.shopId),
            categoryId: this.productForm.value.categoryId ? Number(this.productForm.value.categoryId) : null,
            brandId: this.productForm.value.brandId ? Number(this.productForm.value.brandId) : null,
            image: this.selectedFileBase64
        };

        if (this.isEditing && this.editingProductId) {
            this.productService.updateProduct(this.editingProductId, productData).subscribe(() => {
                this.loadData();
                this.resetForm();
            });
        } else {
            this.productService.createProduct(productData).subscribe(() => {
                this.loadData();
                this.resetForm();
            });
        }
    }

    editProduct(product: any) {
        this.isEditing = true;
        this.editingProductId = product.id;
        this.showForm = true;
        this.productForm.patchValue({
            name: product.name,
            sku: product.sku,
            price: product.price,
            costPrice: product.costPrice,
            stock: product.stock,
            shopId: product.shopId,
            categoryId: product.categoryId,
            brandId: product.brandId,
            barcode: product.barcode,
            description: product.description
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    cancelEdit() {
        this.resetForm();
    }

    resetForm() {
        this.showForm = false;
        this.isEditing = false;
        this.editingProductId = null;
        this.productForm.reset();
        this.imagePreview = null;
        this.selectedFileBase64 = null;
    }
}
