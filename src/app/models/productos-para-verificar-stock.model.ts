export interface ProductosParaVerificarStock {
  idSucursal: number;
  idPedido?: number | null;
  idProducto: number[];
  cantidad: number[];
}
