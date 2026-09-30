export interface PerfilUsuario {
  nombres: string;
  apellidos: string;
  correo: string;
  telefono: string;
  rol: string;
  codigoEmpleado: string;
}

export interface ActualizarPerfilRequest {
  nombres: string;
  apellidos: string;
  telefono: string;
}