import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ShopService } from '../../services/shop.service';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent implements OnDestroy {
  user: any;
  shops: any[] = [];
  selectedShopId: number | null = null;
  isMobileMenuOpen: boolean = false;
  private subs = new Subscription();

  constructor(
    private authService: AuthService,
    private shopService: ShopService
  ) {
    this.subs.add(
      this.authService.currentUser$.subscribe(u => {
        this.user = u;
        this.loadShops();
      })
    );
    this.subs.add(
      this.authService.selectedShopId$.subscribe(id => {
        this.selectedShopId = id;
      })
    );
  }

  loadShops() {
    this.shopService.getAllShops().subscribe(data => {
      this.shops = data;
    });
  }

  onShopChange() {
    this.authService.setSelectedShopId(this.selectedShopId ? Number(this.selectedShopId) : null);
    window.location.reload();
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  logout() {
    this.authService.logout();
  }
}
