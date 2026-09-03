import { Usuario } from '../models/usuario.model';
import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from 'src/environments/environment';
import { LocalStorageKeys, LocalStorageUtil } from '../utils/local-storage-util';
import { JwtHelperService } from '@auth0/angular-jwt';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { UserService } from './user.service';

export const SERVICE_UNAVAILABLE_MESSAGE = 'Servicio no disponible :(';

@Service()
export class AuthService {

  http = inject(HttpClient);
  storageService = inject(LocalStorageUtil);
  usuarioService = inject(UserService);
  jwtHelper = new JwtHelperService();

  login(username: string, password: string) {
    const credential = { username: username, password: password };
    return this.http.post(`${environment.apiUrl}/api/v1/login`, credential, { responseType: 'text' })
      .pipe(tap((token) => {
        this.storageService.setItem(LocalStorageKeys.TOKEN, token);
      }));
  }

  logout() {
    return this.http.put(`${environment.apiUrl}/api/v1/logout`, {})
      .pipe(tap(() => {
        this.storageService.removeItem(LocalStorageKeys.TOKEN);
        this.storageService.removeItem(LocalStorageKeys.CUSTOMER_ACCOUNT);
      }));
  }

  getAuthToken(): string {
    return this.storageService.getItem(LocalStorageKeys.TOKEN);
  }

  isAuthenticated(): boolean {
    const authToken = this.getAuthToken();
    return !!authToken && !this.jwtHelper.isTokenExpired(authToken);
  }

  getLoggedUser(): Observable<Usuario> {
    const authToken = this.getAuthToken();
    const decodedAuthToken = this.jwtHelper.decodeToken(authToken);
    return this.usuarioService.getUser(decodedAuthToken.idUsuario);
  }
}
