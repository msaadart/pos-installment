import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { ShopService } from '../../services/shop.service';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-products',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormsModule],
    template: `
    <div class="container" style="padding-top: 2rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
        <h2>Product Management</h2>
        <div>
            <button class="btn btn-secondary" style="margin-right: 0.5rem;" (click)="showCategoryForm = !showCategoryForm">Add Category</button>
            <button class="btn btn-secondary" style="margin-right: 0.5rem;" (click)="showBrandForm = !showBrandForm">Add Brand</button>
            <button class="btn btn-primary" (click)="toggleForm()">New Product</button>
        </div>
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
        <h3>New Product</h3>
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

            <div class="form-group">
                <label class="form-label">Product Image</label>
                <input type="file" class="form-control" (change)="onFileSelected($event)" accept="image/*">
                <div *ngIf="imagePreview" style="margin-top: 1rem;">
                    <img [src]="imagePreview" style="max-width: 150px; border-radius: 8px;">
                </div>
            </div>

            <button type="submit" class="btn btn-primary" [disabled]="productForm.invalid">Create Product</button>
        </form>
      </div>

      <!-- Product List -->
      <div class="card">
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
                </tr>
            </thead>
            <tbody>
                <tr *ngFor="let product of products" style="border-bottom: 1px solid var(--border-color);">
                    <td style="padding: 1rem;">
                        <img *ngIf="product.imageUrl" [src]="apiUrl + product.imageUrl" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
                        <span *ngIf="!product.imageUrl">-</span>
                    </td>
                    <td style="padding: 1rem;">{{ product.name }}</td>
                    <td style="padding: 1rem;">{{ product.sku }}</td>
                    <td style="padding: 1rem;">Rs. {{ product.price | number:'1.2-2' }}</td>
                    <td style="padding: 1rem;">{{ product.stock }}</td>
                    <td style="padding: 1rem;">{{ product.category?.name || '-' }}</td>
                    <td style="padding: 1rem;">{{ product.brand?.name || '-' }}</td>
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

    productForm: FormGroup;
    showForm = false;
    imagePreview: string | null = null;
    selectedFileBase64: string | null = null;

    showCategoryForm = false;
    showBrandForm = false;
    newCategoryName = '';
    newBrandName = '';

    constructor(
        private productService: ProductService,
        private shopService: ShopService,
        private fb: FormBuilder
    ) {
        this.productForm = this.fb.group({
            name: ['', Validators.required],
            sku: ['', Validators.required],
            price: [0, Validators.required],
            costPrice: [0, Validators.required],
            stock: [0, Validators.required],
            shopId: [Number, Validators.required],
            categoryId: [Number],
            brandId: [Number]
        });
    }

    ngOnInit() {
        this.loadData();
    }

    loadData() {
        this.productService.getAllProducts().subscribe(data => this.products = data);
        this.shopService.getAllShops().subscribe(data => this.shops = data);
        this.productService.getAllCategories().subscribe(data => this.categories = data);
        this.productService.getAllBrands().subscribe(data => this.brands = data);
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
            shopId:Number(this.productForm.value.shopId),
            categoryId: Number(this.productForm.value.categoryId),
            brandId:    Number(this.productForm.value.brandId),
            image: this.selectedFileBase64
        };

        console.log(productData);

        this.productService.createProduct(productData).subscribe(() => {
            this.loadData();
            this.toggleForm();
            this.productForm.reset();
            this.imagePreview = null;
            this.selectedFileBase64 = null;
        });
    }
}
