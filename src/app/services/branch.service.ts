import { HttpClient } from '@angular/common/http';
import { inject, signal, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { Sucursal } from '../models/sucursal.model';
import { environment } from 'src/environments/environment';

@Service()
export class BranchService {

  http = inject(HttpClient);
  $selectedSucursal = signal<Sucursal | null>(null);

  getBranches(): Observable<Array<Sucursal>> {
    return this.http.get<Array<Sucursal>>(`${environment.apiUrl}/api/v1/sucursales`);
  }

  getBranchById(idSucursal: number): Observable<Sucursal> {
    return this.http.get<Sucursal>(`${environment.apiUrl}/api/v1/sucursales/${idSucursal}`);
  }

}
