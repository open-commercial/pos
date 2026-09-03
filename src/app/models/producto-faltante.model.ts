export interface ProductoFaltante {
  idProducto: number;
  codigo: string;
  descripcion: string;
  idSucursal: number;
  nombreSucursal: string;
  cantidadSolicitada: number;
  cantidadDisponible: number;
}
