import { Component, ElementRef, ViewChild, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService, SERVICE_UNAVAILABLE_MESSAGE } from 'src/app/services/auth.service';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from 'src/app/services/notification.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule
]
})
export class LoginComponent {

  @ViewChild('usernameInput') usernameInput?: ElementRef<HTMLInputElement>;
  authService = inject(AuthService);
  formBuilder = inject(FormBuilder);
  router = inject(Router);
  route = inject(ActivatedRoute);
  notificationService = inject(NotificationService);
  $loading = signal(false);

  loginForm = this.formBuilder.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  constructor() {
    this.route.queryParamMap.pipe(
      filter(params => params.get('unauthorized') === 'true'),
      takeUntilDestroyed()
    ).subscribe(() => {
      this.$loading.set(false);
      this.loginForm.enable();
      this.notificationService.openSnackBar(
        '❌ No tiene permisos para acceder',
        '',
        5000
      );
      setTimeout(() => this.usernameInput?.nativeElement.focus(), 0);
      this.router.navigate([], {
        queryParams: { unauthorized: null },
        queryParamsHandling: 'merge',
        replaceUrl: true
      });
    });
  }

  submit() {
    if (this.loginForm.invalid) return;
    this.loginForm.get('username')?.disable();
    this.loginForm.get('password')?.disable();
    this.$loading.set(true);
    const username = this.loginForm.get('username')?.value as string;
    const password = this.loginForm.get('password')?.value as string;
    this.authService.login(username, password).subscribe({
      next: () => {
        this.$loading.set(false);
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.$loading.set(false);
        this.loginForm.get('username')?.enable();
        this.loginForm.get('password')?.enable();
        if (err.status === 0) {
          this.notificationService.openSnackBar(`❌ ${SERVICE_UNAVAILABLE_MESSAGE}`, '', 3500);
        } else {
          this.notificationService.openSnackBar(`❌ ${err.error}`, '', 3500);
        }
        this.usernameInput?.nativeElement.focus();
      }
    });
  }
}
