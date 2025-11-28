import { Observable } from 'rxjs';
import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { BusquedaProductoCriteria } from '../models/busqueda-producto-criteria.model';
import { Pagination } from '../models/pagination.model';
import { Movimiento } from '../models/movimiento.model';

@Injectable({ providedIn: 'root' })
export class ProductoService {

  http = inject(HttpClient);
  baseUrl = environment.apiUrl + '/api/v1/productos';
  criteriaUrl = this.baseUrl + '/busqueda/criteria';

  search(criteria: BusquedaProductoCriteria,
    idSucursal: number,
    idCliente?: number | null,
    movimiento?: Movimiento | null): Observable<Pagination> {
    const query = new URLSearchParams();
    if (idCliente) {
      query.append('idCliente', idCliente.toString());
    }
    if (movimiento) {
      query.append('movimiento', movimiento);
    }
    const qs = query.toString();
    const url = `${this.criteriaUrl}/sucursales/${idSucursal}${(qs ? '?' + qs : '')}`;
    return this.http.post<Pagination>(url, criteria);
  }

}
