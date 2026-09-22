export interface ResumenDashboard {
  materialesActivos: number;
  almacenesRegistrados: number;
  materialesEnAlertaStockMinimo: number;
  valorizacionTotalInventario: number;
}

export interface MaterialMovimiento {
  materialId: number;
  sku: string;
  nombre: string;
  cantidadMovimientos: number;
  unidadesMovidas: number;
}

export interface ValorizacionCategoria {
  categoria: string;
  valorizacion: number;
}

export interface Valorizacion {
  valorizacionTotal: number;
  porCategoria: ValorizacionCategoria[];
}

export interface CumplimientoDespacho {
  materialesActivos: number;
  materialesEnCondicionDeDespacho: number;
  porcentajeCumplimiento: number;
}