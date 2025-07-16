import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Sucursal } from '../models/sucursal';
import { environment } from 'src/environments/environment';
import { StorageService } from './storage.service';

const STORAGE_SUCURSAL_ID_KEY = 'sucursalId';

@Injectable({providedIn: 'root'})
export class SucursalService {

  http = inject(HttpClient);
  storageService = inject(StorageService);
  baseUrl = environment.apiUrl + '/api/v1/sucursales';
  private readonly selectedSucursalIdSubject = new Subject<number|null>();
  selectedSucursalId$ = this.selectedSucursalIdSubject.asObservable();

  getSucursales(): Observable<Array<Sucursal>> {
    return this.http.get<Array<Sucursal>>(this.baseUrl);
  }

  getSucursal(idSucursal: number): Observable<Sucursal> {
    return this.http.get<Sucursal>(`${this.baseUrl}/${idSucursal}`);
  }

  set selectedSucursalId(sucursalId: number) {
    this.storageService.setItem(STORAGE_SUCURSAL_ID_KEY, sucursalId);
    this.selectedSucursalIdSubject.next(sucursalId);
  }

  get selectedSucursalId(): number | null {
    return this.storageService.getItem(STORAGE_SUCURSAL_ID_KEY);
  }
  
}
