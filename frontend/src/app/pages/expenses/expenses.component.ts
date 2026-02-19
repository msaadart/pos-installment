import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ExpenseService } from '../../services/expense.service';
import { ShopService } from '../../services/shop.service';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-expenses',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    template: `
    <div class="container" style="padding-top: 2rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
        <h2>Expense Management</h2>
        <button class="btn btn-primary" (click)="toggleForm()">New Expense</button>
      </div>

      <!-- Add Expense Form -->
      <div *ngIf="showForm" class="card" style="margin-bottom: 2rem;">
        <h3>New Expense</h3>
        <form [formGroup]="expenseForm" (ngSubmit)="onSubmit()">
            <div class="form-group">
                <label class="form-label">Description</label>
                <input type="text" class="form-control" formControlName="description">
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div class="form-group">
                    <label class="form-label">Amount</label>
                    <input type="number" class="form-control" formControlName="amount">
                </div>
                <div class="form-group">
                    <label class="form-label">Category</label>
                    <input type="text" class="form-control" formControlName="category" placeholder="e.g. Rent, Utilities">
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">Shop</label>
                <select class="form-control" formControlName="shopId">
                    <option *ngFor="let shop of shops" [value]="shop.id">{{ shop.name }}</option>
                </select>
            </div>
            <button type="submit" class="btn btn-primary" [disabled]="expenseForm.invalid">Create Expense</button>
        </form>
      </div>

      <!-- Expense List -->
      <div class="card">
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="text-align: left; border-bottom: 1px solid var(--border-color);">
                    <th style="padding: 1rem;">Date</th>
                    <th style="padding: 1rem;">Description</th>
                    <th style="padding: 1rem;">Category</th>
                    <th style="padding: 1rem;">Amount</th>
                    <th style="padding: 1rem;">Shop</th>
                    <th style="padding: 1rem;">Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr *ngFor="let e of expenses" style="border-bottom: 1px solid var(--border-color);">
                    <td style="padding: 1rem;">{{ e.date | date:'shortDate' }}</td>
                    <td style="padding: 1rem;">{{ e.description }}</td>
                    <td style="padding: 1rem;">{{ e.category }}</td>
                    <td style="padding: 1rem; color: red;">Rs. {{ e.amount | number:'1.2-2' }}</td>
                    <td style="padding: 1rem;">{{ e.shop?.name }}</td>
                    <td style="padding: 1rem;">
                        <button class="btn btn-secondary" style="background: red; font-size: 0.8rem;" (click)="deleteExpense(e.id)">Delete</button>
                    </td>
                </tr>
            </tbody>
        </table>
      </div>
    </div>
  `
})
export class ExpensesComponent implements OnInit {
    expenses: any[] = [];
    shops: any[] = [];
    expenseForm: FormGroup;
    showForm = false;

    constructor(
        private expenseService: ExpenseService,
        private shopService: ShopService,
        private authService: AuthService,
        private fb: FormBuilder
    ) {
        this.expenseForm = this.fb.group({
            description: ['', Validators.required],
            amount: [0, [Validators.required, Validators.min(0.01)]],
            category: [''],
            shopId: [null, Validators.required]
        });
    }

    ngOnInit() {
        this.loadData();
    }

    loadData() {
        this.expenseService.getAllExpenses().subscribe(data => this.expenses = data);
        this.shopService.getAllShops().subscribe(data => this.shops = data);
    }

    toggleForm() {
        this.showForm = !this.showForm;
    }

    deleteExpense(id: number) {
        if (confirm('Are you sure you want to delete this expense?')) {
            this.expenseService.deleteExpense(id).subscribe(() => this.loadData());
        }
    }

    onSubmit() {
        if (this.expenseForm.invalid) return;

        const data = {
            ...this.expenseForm.value,
            userId: this.authService.getCurrentUser()?.id,
            shopId: Number(this.expenseForm.value.shopId)
        };

        this.expenseService.createExpense(data).subscribe(() => {
            this.loadData();
            this.toggleForm();
            this.expenseForm.reset();
        });
    }
}
