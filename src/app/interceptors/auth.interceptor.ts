import { AuthService } from 'src/app/services/auth.service';
import { HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, throwError } from 'rxjs';


@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const authToken = this.authService.getToken();

    if (authToken ) {
      req = req.clone({ setHeaders: { Authorization: `Bearer ${authToken}` } });
    }

    return next.handle(req)
      .pipe(catchError(err => {
        if (err.status === 401 || err.status === 403) {
          this.authService.logout();
        }
        return throwError(() => err);
      }))
    ;
  }
}
