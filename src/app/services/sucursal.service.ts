import { Observable, Subject } from 'rxjs';
import { SucursalRepository } from './../repositories/sucursal.repository';
import { Injectable } from '@angular/core';
import { Sucursal } from '../models/sucursal';
import { StorageService } from './storage.service';

export const STORAGE_SUCURSAL_ID_KEY = 'sucursalId';

@Injectable({
  providedIn: 'root'
})
export class SucursalService {
  set selectedSucursalId(value: number) {
    this.storageService.setItem(STORAGE_SUCURSAL_ID_KEY, value);
    this.selectedSucursalIdSubject.next(value);
  }

  get selectedSucursalId(): number|null {
    return this.storageService.getItem(STORAGE_SUCURSAL_ID_KEY);
  }

  private selectedSucursalIdSubject = new Subject<number|null>();
  selectedSucursalId$ = this.selectedSucursalIdSubject.asObservable();

  constructor(private sucursalRepository: SucursalRepository,
              private storageService: StorageService) { }

  getSucursales(): Observable<Sucursal[]> {
    return this.sucursalRepository.getSucursales();
  }
}
