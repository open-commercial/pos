import { Observable } from 'rxjs';
import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { BusquedaProductoCriteria } from '../models/busqueda-producto-criteria.model';
import { Pagination } from '../models/pagination.model';
import { ProductoFaltante } from '../models/producto-faltante.model';
import { ProductosParaVerificarStock } from '../models/productos-para-verificar-stock.model';

@Injectable({ providedIn: 'root' })
export class ProductService {

  http = inject(HttpClient);

  search(criteria: BusquedaProductoCriteria,
    idSucursal: number,
    idCliente?: number | null): Observable<Pagination> {
    const query = new URLSearchParams();
    if (idCliente) {
      query.append('idCliente', idCliente.toString());
    }
    const qs = query.toString();
    const url = `${environment.apiUrl}/api/v1/productos/busqueda/criteria/sucursales/${idSucursal}${(qs ? '?' + qs : '')}`;
    return this.http.post<Pagination>(url, criteria);
  }

  checkStockAvailability(payload: ProductosParaVerificarStock): Observable<ProductoFaltante[]> {
    return this.http.post<ProductoFaltante[]>(`${environment.apiUrl}/api/v1/productos/disponibilidad-stock`, payload);
  }

}
