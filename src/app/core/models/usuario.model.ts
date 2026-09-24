export type RolNombre = 'ADMINISTRADOR' | 'SUPERVISOR_ALMACEN' | 'JEFE_PRODUCCION' | 'ALMACENERO';

export interface Usuario {
  id: number;
  nombres: string;
  apellidos: string;
  correo: string;
  rol: RolNombre;
  activo: boolean;
}

export interface UsuarioRequest {
  nombres: string;
  apellidos: string;
  correo: string;
  rol: RolNombre;
  password?: string; // solo obligatorio al crear
}

export const ROLES_DISPONIBLES: { valor: RolNombre; etiqueta: string }[] = [
  { valor: 'ADMINISTRADOR', etiqueta: 'Administrador' },
  { valor: 'SUPERVISOR_ALMACEN', etiqueta: 'Supervisor de Almacén' },
  { valor: 'JEFE_PRODUCCION', etiqueta: 'Jefe de Producción' },
  { valor: 'ALMACENERO', etiqueta: 'Almacenero' }
];