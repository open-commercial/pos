import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { BusquedaCuentaCorrienteClienteCriteria } from '../models/busqueda-cuenta-corriente-cliente-criteria.model';
import { Pagination } from '../models/pagination.model';

@Injectable({ providedIn: 'root' })
export class AccountService {

  http = inject(HttpClient);
  baseUrl = environment.apiUrl + '/api/v1/cuentas-corriente';

  search(criteria: BusquedaCuentaCorrienteClienteCriteria): Observable<Pagination> {
    return this.http.post<Pagination>(`${this.baseUrl}/clientes/busqueda/criteria`, criteria);
  }

}
