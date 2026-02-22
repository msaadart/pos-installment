import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { CustomerService } from '../../services/customer.service';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-customers',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormsModule],
    template: `
    <div class="container" style="padding-top: 2rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
        <h2>Customer Management</h2>
        <button class="btn btn-primary" (click)="toggleForm()">{{ showForm ? 'Close' : 'New Customer' }}</button>
      </div>

      <!-- Add/Edit Form -->
      <div *ngIf="showForm" class="card" style="margin-bottom: 2rem;">
        <h3>{{ editMode ? 'Edit' : 'New' }} Customer</h3>
        <form [formGroup]="customerForm" (ngSubmit)="onSubmit()">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label class="form-label">Name</label>
              <input type="text" class="form-control" formControlName="name">
            </div>
            <div class="form-group">
              <label class="form-label">Phone</label>
              <input type="text" class="form-control" formControlName="phone">
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label class="form-label">CNIC (Optional)</label>
              <input type="text" class="form-control" formControlName="cnic" placeholder="12345-6789012-3">
            </div>
            <div class="form-group">
              <label class="form-label">Credit Limit (Optional)</label>
              <input type="number" class="form-control" formControlName="creditLimit">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Address</label>
            <textarea class="form-control" formControlName="address"></textarea>
          </div>
          <button type="submit" class="btn btn-primary" [disabled]="customerForm.invalid">
            {{ editMode ? 'Update' : 'Create' }} Customer
          </button>
          <button type="button" class="btn" style="margin-left: 0.5rem;" (click)="toggleForm()">Cancel</button>
        </form>
      </div>

      <!-- Search & Table -->
      <div class="card">
        <div style="margin-bottom: 1.5rem;">
          <input type="text" class="form-control" placeholder="Search by name, phone or cnic..." [(ngModel)]="searchTerm" (input)="filterCustomers()">
        </div>

        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="text-align: left; border-bottom: 1px solid var(--border-color);">
              <th style="padding: 1rem;">Name</th>
              <th style="padding: 1rem;">Phone</th>
              <th style="padding: 1rem;">CNIC</th>
              <th style="padding: 1rem;">Balance</th>
              <th style="padding: 1rem;">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let c of filteredCustomers" style="border-bottom: 1px solid var(--border-color);">
              <td style="padding: 1rem;">{{ c.name }}</td>
              <td style="padding: 1rem;">{{ c.phone }}</td>
              <td style="padding: 1rem;">{{ c.cnic || '-' }}</td>
              <td style="padding: 1rem;">Rs. {{ c.balance | number:'1.2-2' }}</td>
              <td style="padding: 1rem;">
              @if(user?.role === 'SUPER_ADMIN' || user?.role === 'SHOP_ADMIN'){
                <button class="btn btn-secondary" style="font-size: 0.8rem; margin-right: 0.5rem;" (click)="editCustomer(c)">Edit</button>
                <button class="btn btn-danger" style="font-size: 0.8rem;" (click)="deleteCustomer(c.id)">Inactive</button>
              }
              </td>
            </tr>
            <tr *ngIf="filteredCustomers.length === 0">
              <td colspan="5" style="text-align: center; padding: 2rem; color: var(--text-muted);">No customers found</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class CustomersComponent implements OnInit {
    customers: any[] = [];
    filteredCustomers: any[] = [];
    customerForm: FormGroup;
    showForm = false;
    editMode = false;
    selectedCustomerId: number | null = null;
    searchTerm = '';
    user: any = this.authService.getCurrentUser();

    constructor(private customerService: CustomerService, private fb: FormBuilder, public authService: AuthService) {
        this.customerForm = this.fb.group({
            name: ['', Validators.required],
            phone: ['', Validators.required],
            address: [''],
            cnic: [''],
            creditLimit: [0]
        });
    }

    ngOnInit() {
        this.loadCustomers();
    }

    loadCustomers() {
        this.customerService.getAllCustomers().subscribe(data => {
            this.customers = data;
            this.filterCustomers();
        });
    }

    filterCustomers() {
        const term = this.searchTerm.toLowerCase();
        this.filteredCustomers = this.customers.filter(c =>
            c.name.toLowerCase().includes(term) ||
            c.phone.toLowerCase().includes(term) ||
            (c.cnic && c.cnic.toLowerCase().includes(term))
        );
    }

    toggleForm() {
        this.showForm = !this.showForm;
        if (!this.showForm) {
            this.resetForm();
        }
    }

    resetForm() {
        this.editMode = false;
        this.selectedCustomerId = null;
        this.customerForm.reset({ creditLimit: 0 });
    }

    editCustomer(customer: any) {
        this.editMode = true;
        this.selectedCustomerId = customer.id;
        this.showForm = true;
        this.customerForm.patchValue({
            name: customer.name,
            phone: customer.phone,
            address: customer.address,
            cnic: customer.cnic,
            creditLimit: Number(customer.creditLimit)
        });
    }

    deleteCustomer(id: number) {
        if (confirm('Are you sure you want to deactivate this customer?')) {
            this.customerService.deleteCustomer(id).subscribe(() => {
                this.loadCustomers();
            });
        }
    }

    onSubmit() {
        if (this.customerForm.invalid) return;

        const data = {...this.customerForm.value, shopId: this.user?.shopId};
        if (this.editMode && this.selectedCustomerId) {
            this.customerService.updateCustomer(this.selectedCustomerId, data).subscribe(() => {
                this.loadCustomers();
                this.toggleForm();
            });
        } else {
            this.customerService.createCustomer(data).subscribe(() => {
                this.loadCustomers();
                this.toggleForm();
            });
        }
    }
}
