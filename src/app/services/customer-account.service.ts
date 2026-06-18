import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { BusquedaCuentaCorrienteClienteCriteria } from '../models/busqueda-cuenta-corriente-cliente-criteria.model';
import { CuentaCorrienteCliente } from '../models/cuenta-corriente-cliente.model';
import { Pagination } from '../models/pagination.model';

@Injectable({ providedIn: 'root' })
export class CustomerAccountService {

  http = inject(HttpClient);

  search(criteria: BusquedaCuentaCorrienteClienteCriteria): Observable<Pagination> {
    return this.http.post<Pagination>(`${environment.apiUrl}/api/v1/cuentas-corriente/clientes/busqueda/criteria`, criteria);
  }

  getDefaultCustomerAccount(): Observable<CuentaCorrienteCliente> {
    return this.http.get<CuentaCorrienteCliente>(`${environment.apiUrl}/api/v1/cuentas-corriente/clientes/predeterminado`);
  }

}
