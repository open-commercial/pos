import { AuthService } from 'src/app/services/auth.service';
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const authToken = authService.getToken();

  if (authToken) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${authToken}` } });
  }
  
  return next(req).pipe(
    catchError(err => {
      if (err.status === 401 || err.status === 403) {
        authService.logout();
      }
      return throwError(() => err);
    })
  );
};
