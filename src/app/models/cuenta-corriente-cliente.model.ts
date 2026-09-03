import { Cliente } from './cliente.model';

export interface CuentaCorrienteCliente {
  idCuentaCorriente: number;
  eliminada: boolean;
  fechaApertura: Date;
  saldo: number;
  fechaUltimoMovimiento: Date;
  cliente: Cliente;
}
