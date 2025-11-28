import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService, SERVICE_UNAVAILABLE_MESSAGE } from 'src/app/services/auth.service';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ]
})
export class LoginComponent {

  authService = inject(AuthService);
  formBuilder = inject(FormBuilder);
  router = inject(Router);
  notificationService = inject(NotificationService);
  loading = signal(false);

  loginForm = this.formBuilder.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  submit() {
    if (this.loginForm.invalid) return;
    this.loginForm.get('username')?.disable();
    this.loginForm.get('password')?.disable();
    this.loading.set(true);
    const username = this.loginForm.get('username')?.value as string;
    const password = this.loginForm.get('password')?.value as string;
    this.authService.login(username, password).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.loading.set(false);
        this.loginForm.get('username')?.enable();
        this.loginForm.get('password')?.enable();
        if (err.status === 0) {
          this.notificationService.openSnackBar(SERVICE_UNAVAILABLE_MESSAGE, '', 3500);
        } else {
          this.notificationService.openSnackBar(err.error, '', 3500);
        }
      }
    });
  }
}
