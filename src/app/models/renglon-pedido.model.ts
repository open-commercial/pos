export interface RenglonPedido {
  idRenglonPedido: number;
  idProductoItem: number;
  codigoItem: string;
  descripcionItem: string;
  medidaItem: string;
  urlImagenItem: string;
  oferta: boolean;
  cantMinima?: number;
  precioUnitario: number;
  cantidad: number;
  bonificacionPorcentaje: number;
  bonificacionNeta: number;
  importeAnterior: number;
  importe: number;
}
