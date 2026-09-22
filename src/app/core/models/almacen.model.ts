export interface Almacen {
  id: number;
  codigo: string;
  nombre: string;
  direccion: string;
  activo: boolean;
}

export interface AlmacenRequest {
  codigo: string;
  nombre: string;
  direccion: string;
}