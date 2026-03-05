import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { CustomerService } from '../../services/customer.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.css']
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
    const filters = this.searchTerm ? { search: this.searchTerm } : {};
    this.customerService.getAllCustomers(filters).subscribe(data => {
      this.customers = data;
      this.filteredCustomers = data;
    });
  }

  onSearch() {
    this.loadCustomers();
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

    const data = { ...this.customerForm.value, shopId: this.user?.shopId };
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
