import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { ShopService } from '../../services/shop.service';

@Component({
    selector: 'app-users',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.css']
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
            email: ['', [Validators.required, Validators.email]],
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
            this.showForm = false;
            this.userForm.reset({ role: 'SHOP_ADMIN' });
        });
    }
}
