import { TipoDeComprobante } from './tipo-de-comprobante.model';

export interface NuevosResultadosComprobante {
  importe: Array<number>;
  ivaPorcentajes: Array<number>;
  ivaNetos: Array<number>;
  cantidades: Array<number>;
  tipoDeComprobante: TipoDeComprobante;
  descuentoPorcentaje: number;
  recargoPorcentaje: number;
}
