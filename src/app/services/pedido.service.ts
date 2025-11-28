import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { NuevoRenglonPedido } from '../models/nuevo-renglon-pedido.model';
import { RenglonPedido } from '../models/renglon-pedido.model';
import { Observable } from 'rxjs';
import { NuevosResultadosComprobante } from '../models/nuevos-resultados-comprobante.model';
import { Resultados } from '../models/resultados.model';
import { Pedido } from '../models/pedido.model';
import { DetallePedido } from '../models/detalle-pedido.model';

@Injectable({ providedIn: 'root' })
export class PedidoService {

  http = inject(HttpClient);
  baseUrl = environment.apiUrl + '/api/v1/pedidos';

  calcularRenglones(renglones: NuevoRenglonPedido[]): Observable<RenglonPedido[]> {
    return this.http.post<RenglonPedido[]>(`${this.baseUrl}/renglones`, renglones);
  }

  calcularResultadosPedido(nrp: NuevosResultadosComprobante): Observable<Resultados> {
    return this.http.post<Resultados>(`${this.baseUrl}/calculo-pedido`, nrp);
  }

  /*guardarPedido(np: DetallePedido): Observable<Pedido> {
    const method = np.idPedido ? 'put' : 'post';
    return this.http[method]<Pedido>(this.baseUrl, np);
  }*/

  getRenglonesDePedido(idPedido: number, clonar: boolean = false): Observable<RenglonPedido[]> {
    return this.http.get<RenglonPedido[]>(this.baseUrl + `/${idPedido}/renglones` + (clonar ? '?clonar=true' : ''));
  }
}
