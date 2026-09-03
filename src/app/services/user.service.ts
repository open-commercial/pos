import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Usuario } from '../models/usuario.model';

@Service()
export class UserService {

  http = inject(HttpClient);

  getUser(idUsuario: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${environment.apiUrl}/api/v1/usuarios/${idUsuario}`);
  }
  
  setDefaultBranch(idUsuario: number, idSucursal: number): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}/api/v1/usuarios/${idUsuario}/sucursales/${idSucursal}`, {});
  }
}
