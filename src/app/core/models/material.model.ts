export interface Material {
  id: number;
  sku: string;
  nombre: string;
  descripcion: string;
  unidadMedida: string;
  categoria: string;
  stockMinimo: number;
  stockMaximo: number;
  costoUnitario: number;
  requiereLote: boolean;
  imagenUrl: string | null;
  activo: boolean;
}

export interface MaterialRequest {
  sku: string;
  nombre: string;
  descripcion: string;
  unidadMedida: string;
  categoria: string;
  stockMinimo: number;
  stockMaximo: number;
  costoUnitario: number;
  requiereLote: boolean;
  imagenUrl: string | null;
}

export const CATEGORIAS_MATERIAL = [
  'MATERIA_PRIMA',
  'INSUMO',
  'HERRAMIENTA',
  'PRODUCTO_TERMINADO',
  'REPUESTO'
] as const;

export const UNIDADES_MEDIDA = ['KG', 'UND', 'M', 'M2', 'M3', 'L', 'CAJA', 'ROLLO'] as const;