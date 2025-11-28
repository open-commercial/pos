export interface Pedido {
  idPedido: number;
  nroPedido: number;
  fecha: Date;
  fechaVencimiento: Date;
  observaciones: string;
  idSucursal: number;
  nombreSucursal: string;
  eliminado: boolean;
  nombreUsuario: string;
  subTotal: number;
  recargoPorcentaje: number;
  recargoNeto: number;
  descuentoPorcentaje: number;
  descuentoNeto: number;
  total: number;
  cantidadArticulos: number;
  detalleEnvio: string;
  idViajante: number;
  nombreViajante: string;
}
