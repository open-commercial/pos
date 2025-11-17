import { Ubicacion } from './ubicacion.model';
import { CategoriaIVA } from './categoria-iva.model';
import { ConfiguracionSucursal } from './configuracion-sucursal.model';

export interface Sucursal {
  idSucursal: number;
  nombre: string;
  lema?: string;
  categoriaIVA: CategoriaIVA;
  idFiscal?: number;
  ingresosBrutos?: number;
  fechaInicioActividad?: Date;
  email: string;
  telefono?: string;
  ubicacion: Ubicacion;
  detalleUbicacion?: string;
  imagen?: number[];
  logo?: string;
  eliminada?: boolean;
  configuracionSucursal?: ConfiguracionSucursal;
}
