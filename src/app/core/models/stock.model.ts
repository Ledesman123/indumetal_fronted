export interface StockUbicacion {
  materialId: number;
  materialSku: string;
  materialNombre: string;
  unidadMedida: string;
  ubicacionId: number;
  ubicacionCodigo: string;
  almacenNombre: string;
  cantidad: number;
  stockMinimo: number;
  stockMaximo: number;
}