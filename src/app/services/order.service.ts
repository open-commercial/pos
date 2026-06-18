import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from 'src/environments/environment';
import { NuevoRenglonPedido } from '../models/nuevo-renglon-pedido.model';
import { RenglonPedido } from '../models/renglon-pedido.model';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { NuevosResultadosPedido } from '../models/nuevos-resultados-pedido.model';
import { Resultados } from '../models/resultados.model';
import { Pedido } from '../models/pedido.model';
import { NuevoPedido } from '../models/nuevo-pedido.model';
import { Producto } from "../models/producto.model";
import { LocalStorageKeys, LocalStorageUtil } from "../utils/local-storage-util";

@Injectable({ providedIn: 'root' })
export class OrderService {

  http = inject(HttpClient);
  localStorageUtil = inject(LocalStorageUtil);
  private readonly _newOrder = signal<NuevoPedido>({});
  $newOrder = this._newOrder.asReadonly();

  constructor() {
    const storedOrder = this.localStorageUtil.getItem(LocalStorageKeys.ORDER);
    if (storedOrder) {
      this._newOrder.set(storedOrder);
    }
  }

  calculateOrderLines(nrp: NuevoRenglonPedido[]): Observable<RenglonPedido[]> {
    return this.http.post<RenglonPedido[]>(`${environment.apiUrl}/api/v1/pedidos/renglones`, nrp);
  }

  calculateOrderSummary(nrp: NuevosResultadosPedido): Observable<Resultados> {
    return this.http.post<Resultados>(`${environment.apiUrl}/api/v1/pedidos/calculo-pedido`, nrp);
  }

  addOrderLine(p: Producto) {
    this._newOrder.set({});
  }

  removeOrderLine(p: Producto) {
    this._newOrder.set({});
  }

  saveOrder(np: NuevoPedido): Observable<Pedido> {
    return this.http.post<Pedido>(`${environment.apiUrl}/api/v1/pedidos`, np).pipe(
      tap(() => this.localStorageUtil.removeItem(LocalStorageKeys.ORDER))
    );
  }
}
