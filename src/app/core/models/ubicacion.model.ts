export interface Ubicacion {
  id: number;
  codigo: string;
  almacenId: number;
  activo: boolean;
}

export interface UbicacionRequest {
  codigo: string;
  almacenId: number;
}