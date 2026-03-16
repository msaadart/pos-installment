import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { ExpenseService } from '../../services/expense.service';
import { ShopService } from '../../services/shop.service';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-expenses',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormsModule],
    templateUrl: './expenses.component.html',
    styleUrls: ['./expenses.component.css']
})
export class ExpensesComponent implements OnInit {
    expenses: any[] = [];
    totalExpense: number = 0;
    shops: any[] = [];
    expenseForm: FormGroup;
    showForm = false;
    user: any = this.authService.getCurrentUser();

    searchTerm = '';
    startDate = '';
    endDate = '';

    constructor(
        private expenseService: ExpenseService,
        private shopService: ShopService,
        public authService: AuthService,
        private fb: FormBuilder
    ) {
        this.expenseForm = this.fb.group({
            description: ['', Validators.required],
            amount: [0, [Validators.required, Validators.min(0.01)]],
            category: [''],
            paymentMethod: ['CASH', Validators.required], 
            referenceId: [''], 
            date: [''],
            shopId: [null, Validators.required],
            allowDeleted: [true]         
        });
    }

    ngOnInit() {
        if (this.user?.role !== 'SUPER_ADMIN') {
            this.expenseForm.patchValue({ shopId: this.user.shopId });
            this.expenseForm.get('shopId')?.disable();
        } else {
            this.expenseForm.get('shopId')?.enable();
        }
        this.loadData();
    }

    loadData() {
        const filters: any = {};
        if (this.user.role !== 'SUPER_ADMIN') {
            filters.shopId = this.user.shopId;
        }
        if (this.searchTerm) filters.search = this.searchTerm;
        if (this.startDate) filters.startDate = this.startDate;
        if (this.endDate) filters.endDate = this.endDate;
        this.expenseService.getAllExpenses(filters).subscribe(data => {this.expenses = data.data, this.totalExpense = data.totalExpense});
        this.shopService.getAllShops().subscribe(data => this.shops = data);
        console.log(this.expenses);
    }

    onSearch() {
        this.loadData();
    }

    clearForm() {
        this.searchTerm = '';
        this.startDate = '';
        this.endDate = '';
        this.loadData();
    }

    toggleForm() {
        this.showForm = !this.showForm;
    }

    deleteExpense(id: number) {
        if (confirm('Are you sure you want to deactivate this expense? It will be marked as inactive.')) {
            this.expenseService.deleteExpense(id).subscribe(() => {
                this.loadData();
            });
        }
    }

    onSubmit() {
        if (this.expenseForm.invalid) return;

        const data = {
            ...this.expenseForm.value,
            userId: this.authService.getCurrentUser()?.id,
            shopId: this.user?.role !== 'SUPER_ADMIN' ? this.user.shopId : Number(this.expenseForm.value.shopId)
        };

        this.expenseService.createExpense(data).subscribe(() => {
            this.loadData();
            this.toggleForm();
            this.expenseForm.reset();
        });
    }
}
