import { Rol } from "./rol.model";

export interface Usuario {
  idUsuario: number;
  username: string;
  password?: string;
  nombre: string;
  apellido: string;
  email: string;
  idSucursalPredeterminada: number;
  roles: Array<Rol>;
  habilitado: boolean;
}
