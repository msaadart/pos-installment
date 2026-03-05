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
    templateUrl: './products.component.html',
    styleUrls: ['./products.component.css']
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
