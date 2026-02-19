import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-container">
      <div class="card login-card">
        <h2 style="text-align: center; margin-bottom: 1.5rem;">Sign In</h2>
        
        <div *ngIf="error" class="alert alert-danger">
            {{ error }}
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" class="form-control" formControlName="email" placeholder="Enter your email">
          </div>

          <div class="form-group">
            <label class="form-label">Password</label>
            <input type="password" class="form-control" formControlName="password" placeholder="Enter your password">
          </div>

          <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1rem;" [disabled]="loginForm.invalid || loading">
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      background-color: var(--bg-main);
    }
    .login-card {
      width: 100%;
      max-width: 400px;
    }
    .alert {
      padding: 0.75rem 1rem;
      border-radius: var(--radius-md);
      margin-bottom: 1rem;
      font-size: 0.875rem;
    }
    .alert-danger {
      background-color: #fef2f2;
      color: #991b1b;
      border: 1px solid #fecaca;
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.error = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.error = err.error?.message || 'Login failed';
        this.loading = false;
      }
    });
  }
}
