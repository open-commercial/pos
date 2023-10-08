import { Injectable } from '@angular/core';
import { UsuarioRepository } from '../repositories/usuario.repository';
import { Observable } from 'rxjs';
import { Usuario } from '../models/usuario';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  constructor(private usuarioRepository: UsuarioRepository) { }

  getUsuario(idUsuario: number): Observable<Usuario> {
    return this.usuarioRepository.getUsuario(idUsuario);
  }
}
