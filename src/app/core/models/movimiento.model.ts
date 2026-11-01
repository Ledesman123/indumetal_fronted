/** Tipos que el usuario puede registrar desde el formulario de Movimientos. */
export type TipoMovimiento = 'INGRESO' | 'SALIDA' | 'DEVOLUCION' | 'TRANSFERENCIA';

/**
 * Tipos tal como los guarda el backend: una transferencia genera dos registros
 * (TRANSFERENCIA_SALIDA + TRANSFERENCIA_ENTRADA) y el inventario fisico genera ajustes.
 */
export type TipoMovimientoRegistrado =
  | 'INGRESO'
  | 'SALIDA'
  | 'DEVOLUCION'
  | 'TRANSFERENCIA_SALIDA'
  | 'TRANSFERENCIA_ENTRADA'
  | 'AJUSTE_POSITIVO'
  | 'AJUSTE_NEGATIVO';

export interface MovimientoAlmacen {
  id: number;
  tipo: TipoMovimientoRegistrado;
  materialId: number;
  materialSku: string;
  materialNombre: string;
  unidadMedida?: string;
  ubicacionId: number;
  ubicacionCodigo: string;
  cantidad: number;
  saldoResultante: number;
  lote?: string;
  fechaVencimiento?: string;
  ordenCompra?: string;
  proveedor?: string;
  ordenProduccion?: string;
  areaSolicitante?: string;
  movimientoRelacionadoId?: number;
  observaciones?: string;
  usuario: string;
  creadoEn: string;
}

export interface IngresoRequest {
  materialId: number;
  ubicacionId: number | null; // null = asignacion automatica (RF-07)
  cantidad: number;
  lote?: string;
  fechaVencimiento?: string; // yyyy-MM-dd
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
