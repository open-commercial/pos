import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Rol } from '../models/rol.model';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }

  return authService.getLoggedUser().pipe(
    map(user => user.roles.includes(Rol.ADMINISTRADOR)
      ? true
      : router.createUrlTree(['/login'], { queryParams: { unauthorized: true } }))
  );
};
