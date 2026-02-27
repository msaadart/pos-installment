import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { ShopService } from '../../services/shop.service';

@Component({
    selector: 'app-users',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    template: `
    <div class="container" style="padding-top: 2rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
        <h2>User Management</h2>
        <button class="btn btn-primary" (click)="toggleForm()">New User</button>
      </div>

      <!-- Add Form -->
      <div *ngIf="showForm" class="card" style="margin-bottom: 2rem;">
        <h3>New User</h3>
        <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
            <div class="form-group">
                <label class="form-label">Name</label>
                <input type="text" class="form-control" formControlName="name">
            </div>
            <div class="form-group">
                <label class="form-label">Email</label>
                <input type="text" class="form-control" formControlName="email">
            </div>
            <div class="form-group">
                <label class="form-label">Password</label>
                <input type="password" class="form-control" formControlName="password">
            </div>
            <div class="form-group">
                <label class="form-label">Role</label>
                <select class="form-control" formControlName="role">
                    <option value="SHOP_ADMIN">Shop Admin</option>
                    <option value="SALES_USER">Sales User</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Shop</label>
                <select class="form-control" formControlName="shopId">
                    <option *ngFor="let shop of shops" [value]="shop.id">{{ shop.name }}</option>
                </select>
            </div>
            <button type="submit" class="btn btn-primary" [disabled]="userForm.invalid">Create User</button>
        </form>
      </div>

      <!-- User List -->
      <div class="card">
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="text-align: left; border-bottom: 1px solid var(--border-color);">
                    <th style="padding: 1rem;">Name</th>
                    <th style="padding: 1rem;">Email</th>
                    <th style="padding: 1rem;">Role</th>
                    <th style="padding: 1rem;">Shop</th>
                </tr>
            </thead>
            <tbody>
                <tr *ngFor="let user of users" style="border-bottom: 1px solid var(--border-color);">
                    <td style="padding: 1rem;">{{ user.name }}</td>
                    <td style="padding: 1rem;">{{ user.email }}</td>
                    <td style="padding: 1rem;">{{ user.role }}</td>
                    <td style="padding: 1rem;">{{ user.shop?.name || '-' }}</td>
                </tr>
            </tbody>
        </table>
      </div>
    </div>
  `
})
export class UsersComponent implements OnInit {
    users: any[] = [];
    shops: any[] = [];
    userForm: FormGroup;
    showForm = false;

    constructor(
        private userService: UserService,
        private shopService: ShopService,
        private fb: FormBuilder
    ) {
        this.userForm = this.fb.group({
            name: ['', Validators.required],
            email: ['', [Validators.required]],
            password: ['', Validators.required],
            role: ['SHOP_ADMIN', Validators.required],
            shopId: [null, Validators.required]
        });
    }

    ngOnInit() {
        this.loadUsers();
        this.loadShops();
    }

    loadUsers() {
        this.userService.getAllUsers().subscribe(data => this.users = data);
    }

    loadShops() {
        this.shopService.getAllShops().subscribe(data => this.shops = data);
    }

    toggleForm() {
        this.showForm = !this.showForm;
    }

    onSubmit() {
        if (this.userForm.invalid) return;
        const formValue = {
            ...this.userForm.value,
            shopId: Number(this.userForm.value.shopId)
        };
        

        this.userService.createUser(formValue).subscribe(() => {
            this.loadUsers();
            this.toggleForm();
            this.userForm.reset({ role: 'SHOP_ADMIN' });
        });
    }
}
