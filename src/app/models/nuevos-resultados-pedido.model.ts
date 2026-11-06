export interface NuevosResultadosPedido {
  importe: Array<number>;
  ivaPorcentajes: Array<number>;
  ivaNetos: Array<number>;
  cantidades: Array<number>;
  descuentoPorcentaje: number;
  recargoPorcentaje: number;
}
