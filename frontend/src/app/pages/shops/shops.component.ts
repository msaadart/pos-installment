import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ShopService } from '../../services/shop.service';

@Component({
    selector: 'app-shops',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    template: `
    <div class="container" style="padding-top: 2rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
        <h2>Shop Management</h2>
        <button class="btn btn-primary" (click)="toggleForm()">
            {{ showForm ? 'Cancel' : 'Add New Shop' }}
        </button>
      </div>

      <!-- Add/Edit Form -->
      <div *ngIf="showForm" class="card" style="margin-bottom: 2rem;">
        <h3 style="margin-bottom: 1rem;">{{ editingShop ? 'Edit Shop' : 'New Shop' }}</h3>
        <form [formGroup]="shopForm" (ngSubmit)="onSubmit()">
            <div class="form-group">
                <label class="form-label">Shop Name</label>
                <input type="text" class="form-control" formControlName="name">
            </div>
            <div class="form-group">
                <label class="form-label">Address</label>
                <input type="text" class="form-control" formControlName="address">
            </div>
            <div class="form-group">
                <label class="form-label">Contact</label>
                <input type="text" class="form-control" formControlName="contact">
            </div>
            <button type="submit" class="btn btn-primary" [disabled]="shopForm.invalid">Save Shop</button>
        </form>
      </div>

      <!-- Shop List -->
      <div class="card">
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="text-align: left; border-bottom: 1px solid var(--border-color);">
                    <th style="padding: 1rem;">ID</th>
                    <th style="padding: 1rem;">Name</th>
                    <th style="padding: 1rem;">Address</th>
                    <th style="padding: 1rem;">Contact</th>
                    <th style="padding: 1rem;">Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr *ngFor="let shop of shops" style="border-bottom: 1px solid var(--border-color);">
                    <td style="padding: 1rem;">{{ shop.id }}</td>
                    <td style="padding: 1rem;">{{ shop.name }}</td>
                    <td style="padding: 1rem;">{{ shop.address }}</td>
                    <td style="padding: 1rem;">{{ shop.contact }}</td>
                    <td style="padding: 1rem;">
                        <button class="btn btn-primary" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;" (click)="editShop(shop)">Edit</button>
                    </td>
                </tr>
            </tbody>
        </table>
      </div>
    </div>
  `
})
export class ShopsComponent implements OnInit {
    shops: any[] = [];
    shopForm: FormGroup;
    showForm = false;
    editingShop: any = null;

    constructor(private shopService: ShopService, private fb: FormBuilder) {
        this.shopForm = this.fb.group({
            name: ['', Validators.required],
            address: ['', Validators.required],
            contact: ['', Validators.required]
        });
    }

    ngOnInit() {
        this.loadShops();
    }

    loadShops() {
        this.shopService.getAllShops().subscribe(data => this.shops = data);
    }

    toggleForm() {
        this.showForm = !this.showForm;
        this.editingShop = null;
        this.shopForm.reset();
    }

    editShop(shop: any) {
        this.editingShop = shop;
        this.showForm = true;
        this.shopForm.patchValue(shop);
    }

    onSubmit() {
        if (this.shopForm.invalid) return;

        if (this.editingShop) {
            this.shopService.updateShop(this.editingShop.id, this.shopForm.value).subscribe(() => {
                this.loadShops();
                this.toggleForm();
            });
        } else {
            this.shopService.createShop(this.shopForm.value).subscribe(() => {
                this.loadShops();
                this.toggleForm();
            });
        }
    }
}
