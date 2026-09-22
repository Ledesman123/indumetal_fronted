import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import {
  CumplimientoDespacho,
  MaterialMovimiento,
  ResumenDashboard,
  Valorizacion
} from '../models/dashboard.model';

/**
 * TEMPORAL (Sprint 2): datos simulados con la misma forma que devolvera
 * el backend real en Sprint 3 (GET /api/dashboard/*). Ver DashboardService
 * y DashboardController del lado de Spring Boot para el contrato exacto.
 */
@Injectable({ providedIn: 'root' })
export class DashboardService {
  resumen(): Observable<ResumenDashboard> {
    return of({
      materialesActivos: 3,
      almacenesRegistrados: 1,
      materialesEnAlertaStockMinimo: 1,
      valorizacionTotalInventario: 12480.5
    }).pipe(delay(400));
  }

  materialesConMayorMovimiento(): Observable<MaterialMovimiento[]> {
    return of([
      { materialId: 1, sku: 'MP-0001', nombre: 'Plancha de acero A36 4mm', cantidadMovimientos: 18, unidadesMovidas: 940 },
      { materialId: 2, sku: 'INS-0012', nombre: 'Electrodo E6011 1/8"', cantidadMovimientos: 12, unidadesMovidas: 65 },
      { materialId: 3, sku: 'HTA-0005', nombre: 'Disco de corte 7"', cantidadMovimientos: 7, unidadesMovidas: 30 }
    ]).pipe(delay(400));
  }

  valorizacion(): Observable<Valorizacion> {
    return of({
      valorizacionTotal: 12480.5,
      porCategoria: [
        { categoria: 'MATERIA_PRIMA', valorizacion: 9600 },
        { categoria: 'INSUMO', valorizacion: 2080.5 },
        { categoria: 'HERRAMIENTA', valorizacion: 800 }
      ]
    }).pipe(delay(400));
  }

  cumplimientoDespacho(): Observable<CumplimientoDespacho> {
    return of({
      materialesActivos: 3,
      materialesEnCondicionDeDespacho: 2,
      porcentajeCumplimiento: 66.7
    }).pipe(delay(400));
  }
}