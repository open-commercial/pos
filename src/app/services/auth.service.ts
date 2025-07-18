import { Usuario } from './../models/usuario';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { StorageService } from './storage.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';
import { finalize, tap } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { UsuarioService } from './usuario.service';
import { SucursalService } from './sucursal.service';

export const STORAGE_AUTH_TOKEN_KEY = 'token';

export interface Credential {
  username: string;
  password: string;
}

const loginUrl = environment.apiUrl + '/api/v1/login';
const logoutUrl = environment.apiUrl + '/api/v1/logout';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  http = inject(HttpClient);
  storageService = inject(StorageService);
  router = inject(Router);
  usuarioService = inject(UsuarioService);
  sucursalService = inject(SucursalService);
  jwtHelper = new JwtHelperService();
  private pUser: Usuario | null = null;
  get user(): Usuario | null {
    return this.pUser;
  }
  set user(value: Usuario) {
    this.pUser = value;
    this.userSubjet.next(value);
  }
  private readonly userSubjet = new Subject<Usuario>();
  user$ = this.userSubjet.asObservable();

  login(
    credencial: Credential,
    before: (() => void) | null = null,
    success: (() => void) | null = null,
    error: ((error: string) => void) | null = null,
    done: (() => void) | null = null,
  ) {
    if (this.isAuthenticated()) { return; }
    if (typeof before === 'function') { before(); }
    this.http.post(loginUrl, credencial, { responseType: 'text' })
      .pipe(finalize(() => { if (typeof done === 'function') { done(); } }))
      .subscribe({
        next: token => {
          this.storageService.setItem(STORAGE_AUTH_TOKEN_KEY, token);
          if (typeof success === 'function') { success(); }
          this.router.navigate(['pos']);
        },
        error: (err) => {
          if (typeof error === 'function') {
            const msjError = err.status === 0 ? 'Servicio no disponible :(' : err.error;
            error(msjError);
          }
        }
      })
      ;
  }

  logout(
    before: (() => void) | null = null,
    success: (() => void) | null = null,
    error: ((error: any) => void) | null = null,
    done: (() => void) | null = null,
  ) {
    if (typeof before === 'function') { before(); }
    this.http.put(logoutUrl, {})
      .subscribe({
        next: () => {
          this.cleanAccessTokenInLocalStorage();
          this.cleanSessionStorage();
          if (typeof success === 'function') { success(); }
          this.router.navigate(['login']);
        },
        error: (err) => { if (typeof error === 'function') { error(err) } },
        complete: () => { if (typeof done === 'function') { done(); } }
      })
      ;
  }

  cleanAccessTokenInLocalStorage() {
    this.storageService.removeItem(STORAGE_AUTH_TOKEN_KEY);
  }

  cleanSessionStorage() {
    sessionStorage.clear();
  }

  getToken(): string {
    return this.storageService.getItem(STORAGE_AUTH_TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && !this.jwtHelper.isTokenExpired(token);
  }

  private getLoggedInIdUsuario(): number | null {
    const token = this.getToken();
    if (!token) { return null; }

    const decodedToken = this.jwtHelper.decodeToken(token);
    return decodedToken.idUsuario;
  }

  getLoggedInUsuario(): Observable<Usuario> | null {
    const idUsuario = this.getLoggedInIdUsuario();
    if (idUsuario === null) { return null; }
    return this.usuarioService.getUsuario(idUsuario)
      .pipe(tap(u => {
        this.user = u;
        if (!this.sucursalService.selectedSucursalId && u.idSucursalPredeterminada) {
          this.sucursalService.selectedSucursalId = u.idSucursalPredeterminada;
        }
      }))
      ;
  }
}
