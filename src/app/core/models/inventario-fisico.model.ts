export type EstadoInventario = 'EN_PROCESO' | 'CERRADO';

export interface ItemInventarioFisico {
  materialId: number;
  materialSku: string;
  materialNombre: string;
  ubicacionId: number;
  ubicacionCodigo: string;
  stockSistema: number;
  stockContado: number | null;
  diferencia: number | null;
}

export interface InventarioFisico {
  id: number;
  fechaInicio: string;
  fechaCierre: string | null;
  estado: EstadoInventario;
  responsable: string;
  items: ItemInventarioFisico[];
}