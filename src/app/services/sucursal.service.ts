import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { Sucursal } from '../models/sucursal';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class SucursalService {

  http = inject(HttpClient);
  baseUrl = environment.apiUrl + '/api/v1/sucursales';
  $selectedSucursal = signal<Sucursal | null>(null);

  getSucursales(): Observable<Array<Sucursal>> {
    return this.http.get<Array<Sucursal>>(this.baseUrl);
  }

  getSucursalById(idSucursal: number): Observable<Sucursal> {
    return this.http.get<Sucursal>(`${this.baseUrl}/${idSucursal}`);
  }

}
