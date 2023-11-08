import { Observable } from 'rxjs';
import { BusquedaProductoCriteria } from './../models/criteria/busqueda-producto-criteria';
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { Pagination } from '../models/pagination';
import { Movimiento } from '../models/movimiento';

const baseUrl = environment.apiUrl + '/api/v1/productos';
const criteriaUrl = baseUrl + '/busqueda/criteria';

@Injectable({
  providedIn: 'root'
})
export class ProductoRepository {

  constructor(private http: HttpClient) { }

  buscar(
    criteria: BusquedaProductoCriteria,
    idSucursal: number,
    idCliente?: number|null,
    movimiento?: Movimiento|null
  ): Observable<Pagination> {
      const query = new URLSearchParams();
      if (idCliente) { query.append('idCliente', idCliente.toString()); }
      if (movimiento) { query.append('movimiento', movimiento); }
      const qs = query.toString();

      const url = `${criteriaUrl}/sucursales/${idSucursal}${(qs ? '?' + qs : '')}`;
      return this.http.post<Pagination>(url, criteria);
  }
}
