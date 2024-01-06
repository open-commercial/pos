import { Injectable } from '@angular/core';
import { ProductoRepository } from '../repositories/producto.respository';
import { Observable } from 'rxjs';
import { Pagination } from '../models/pagination';
import { BusquedaProductoCriteria } from '../models/criteria/busqueda-producto-criteria';
import { Movimiento } from '../models/movimiento';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  constructor(private productoRepository: ProductoRepository) { }

  getProductos(
    criteria: BusquedaProductoCriteria,
    idSucursal: number,
    idCliente?: number|null,
    movimiento?: Movimiento|null
  ): Observable<Pagination> {
    return this.productoRepository.buscar(criteria, idSucursal, idCliente, movimiento);
  }
}
