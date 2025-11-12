import { Usuario } from './../models/usuario';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { StorageKeys, StorageService } from './storage.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { UsuarioService } from './usuario.service';

export const SERVICE_UNAVAILABLE_MESSAGE = 'Servicio no disponible :(';

@Injectable({ providedIn: 'root' })
export class AuthService {

  http = inject(HttpClient);
  storageService = inject(StorageService);
  usuarioService = inject(UsuarioService);
  jwtHelper = new JwtHelperService();
  urlLogin = environment.apiUrl + '/api/v1/login';
  urlLogout = environment.apiUrl + '/api/v1/logout';

  login(username: string, password: string) {
    const credential = { username: username, password: password };
    return this.http.post(this.urlLogin, credential, { responseType: 'text' })
      .pipe(tap((token) => {
        this.storageService.setItem(StorageKeys.TOKEN, token);
      }));
  }

  logout() {
    return this.http.put(this.urlLogout, {})
      .pipe(tap(() => {
        this.storageService.removeItem(StorageKeys.TOKEN);
      }));
  }

  getAuthToken(): string {
    return this.storageService.getItem(StorageKeys.TOKEN);
  }

  isAuthenticated(): boolean {
    const authToken = this.getAuthToken();
    return !!authToken && !this.jwtHelper.isTokenExpired(authToken);
  }

  getLoggedUser(): Observable<Usuario> {
    const authToken = this.getAuthToken();
    const decodedAuthToken = this.jwtHelper.decodeToken(authToken);
    return this.usuarioService.getUsuario(decodedAuthToken.idUsuario);
  }
}
