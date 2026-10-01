export interface PerfilUsuario {
  nombres: string;
  apellidos: string;
  correo: string;
  telefono: string;
  rol: string;
  codigoEmpleado: string;
  fotoUrl: string | null;
}

export interface ActualizarPerfilRequest {
  nombres: string;
  apellidos: string;
  telefono: string;
  fotoUrl?: string | null;
}