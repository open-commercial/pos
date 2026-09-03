import { HttpClient } from '@angular/common/http';
import { inject, signal, Service } from '@angular/core';
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

@Service()
export class OrderService {

  http = inject(HttpClient);
  localStorageUtil = inject(LocalStorageUtil);
  private readonly _newOrder = signal<Partial<NuevoPedido>>({});
  $newOrder = this._newOrder.asReadonly();
  private readonly _updatingOrder = signal(false);
  $updatingOrder = this._updatingOrder.asReadonly();

  setUpdatingOrder(value: boolean) {
    this._updatingOrder.set(value);
  }

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

  setOrderLines(orderLines: Array<NuevoRenglonPedido>) {
    const updatedOrder: Partial<NuevoPedido> = { ...this._newOrder(), renglones: orderLines };
    this._newOrder.set(updatedOrder);
    this.localStorageUtil.setItem(LocalStorageKeys.ORDER, updatedOrder);
  }

  addOrderLine(p: Producto) {
    const currentLines = this._newOrder().renglones ?? [];
    const existing = currentLines.find(r => r.idProductoItem === p.idProducto);
    const updatedLines = existing
      ? currentLines.map(r => r.idProductoItem === p.idProducto ? { ...r, cantidad: r.cantidad + 1 } : r)
      : [...currentLines, { idProductoItem: p.idProducto, cantidad: 1 }];
    this.setOrderLines(updatedLines);
  }

  removeOrderLine(p: Producto) {
    const currentLines = this._newOrder().renglones ?? [];
    const updatedLines = currentLines
      .map(r => r.idProductoItem === p.idProducto ? { ...r, cantidad: r.cantidad - 1 } : r)
      .filter(r => r.cantidad > 0);
    this.setOrderLines(updatedLines);
  }

  saveOrder(np: NuevoPedido): Observable<Pedido> {
    return this.http.post<Pedido>(`${environment.apiUrl}/api/v1/pedidos`, np).pipe(
      tap(() => this.localStorageUtil.removeItem(LocalStorageKeys.ORDER))
    );
  }
}
