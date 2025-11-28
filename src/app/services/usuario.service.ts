import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Usuario } from '../models/usuario.model';

@Injectable({providedIn: 'root'})
export class UsuarioService {

  http = inject(HttpClient);
  baseUrl = environment.apiUrl + '/api/v1/usuarios';

  getUsuario(idUsuario: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.baseUrl}/${idUsuario}`);
  }
  
  setSucursalDefault(idUsuario: number, idSucursal: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${idUsuario}/sucursales/${idSucursal}`, {});
  }
}
