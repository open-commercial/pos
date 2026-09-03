import { NuevoRenglonPedido } from './nuevo-renglon-pedido.model';
import { TipoDeEnvio } from './tipo-de-envio';

export interface NuevoPedido {
  idSucursal: number;
  observaciones?: string;
  idCliente: number;
  tipoDeEnvio: TipoDeEnvio;
  renglones: Array<NuevoRenglonPedido>;
  idsFormaDePago: Array<number>;
  montos: Array<number>;
  recargoPorcentaje: number;
  descuentoPorcentaje: number;
}
