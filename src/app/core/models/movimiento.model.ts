export type TipoMovimiento = 'INGRESO' | 'SALIDA' | 'DEVOLUCION' | 'TRANSFERENCIA';

export interface MovimientoAlmacen {
  id: number;
  tipo: TipoMovimiento;
  materialId: number;
  materialSku: string;
  materialNombre: string;
  ubicacionId: number;
  ubicacionCodigo: string;
  ubicacionDestinoId?: number;
  ubicacionDestinoCodigo?: string;
  cantidad: number;
  saldoResultante: number;
  lote?: string;
  fechaVencimiento?: string;
  ordenCompra?: string;
  proveedor?: string;
  ordenProduccion?: string;
  areaSolicitante?: string;
  usuario: string;
  creadoEn: string;
}

export interface IngresoRequest {
  materialId: number;
  ubicacionId: number | null; // null = asignacion automatica (RF-07)
  cantidad: number;
  lote?: string;
  fechaVencimiento?: string;
  ordenCompra?: string;
  proveedor?: string;
}

export interface SalidaRequest {
  materialId: number;
  ubicacionId: number;
  cantidad: number;
  ordenProduccion?: string;
  areaSolicitante?: string;
}

export interface DevolucionRequest {
  materialId: number;
  ubicacionId: number;
  cantidad: number;
  ordenProduccion?: string;
  motivo?: string;
}

export interface TransferenciaRequest {
  materialId: number;
  ubicacionOrigenId: number;
  ubicacionDestinoId: number;
  cantidad: number;
}