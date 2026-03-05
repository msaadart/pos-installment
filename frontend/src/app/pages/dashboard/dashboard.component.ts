import { Component, OnInit } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

import { FormsModule } from '@angular/forms';
import { ReportService } from '../../services/report.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, AsyncPipe, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  user$ = this.authService.currentUser$;
  stats: any = null;
  startDate: string = '';
  endDate: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private reportService: ReportService
  ) { }

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    const filters: any = {};
    if (this.startDate) filters.startDate = this.startDate;
    if (this.endDate) filters.endDate = this.endDate;
    this.reportService.getDashboardStats(filters).subscribe(data => this.stats = data);
  }

  resetFilters() {
    this.startDate = '';
    this.endDate = '';
    this.loadStats();
  }

  logout() {
    this.authService.logout();
  }
}
