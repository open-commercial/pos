import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Usuario } from '../models/usuario';

const baseUrl = environment.apiUrl + '/api/v1/usuarios';

@Injectable({
  providedIn: 'root'
})
export class UsuarioRepository {

  constructor(private http: HttpClient) { }

  getUsuario(idUsuario: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${baseUrl}/${idUsuario}`);
  }
}
