import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ShopService } from '../../services/shop.service';

@Component({
    selector: 'app-shops',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './shops.component.html',
    styleUrls: ['./shops.component.css']
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
