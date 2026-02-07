import { NuevoRenglonPedido } from './nuevo-renglon-pedido.model';

export interface NuevoPedido {
  idPedido?: number;
  idSucursal?: number;
  observaciones?: string;
  idCliente?: number;
  renglones?: Array<NuevoRenglonPedido>;
  idsFormaDePago?: Array<number>;
  montos?: Array<number>;
  recargoPorcentaje?: number;
  descuentoPorcentaje?: number;
}
