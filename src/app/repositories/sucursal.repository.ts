import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Sucursal } from '../models/sucursal';
import { environment } from 'src/environments/environment';

const baseUrl = environment.apiUrl + '/api/v1/sucursales';

@Injectable({
  providedIn: 'root'
})
export class SucursalRepository {
  constructor(private http: HttpClient) { }

  getSucursales(): Observable<Array<Sucursal>> {
    return this.http.get<Array<Sucursal>>(baseUrl);
  }

  getSucursal(idSucursal: number): Observable<Sucursal> {
    return this.http.get<Sucursal>(`${baseUrl}/${idSucursal}`);
  }
}
