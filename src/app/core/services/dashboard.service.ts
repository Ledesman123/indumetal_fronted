import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import {
  CumplimientoDespacho,
  MaterialMovimiento,
  ResumenDashboard,
  Valorizacion
} from '../models/dashboard.model';

/** RF-14: indicadores del dashboard contra /api/dashboard/*. */
@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/dashboard`;

  resumen(): Observable<ResumenDashboard> {
    return this.http.get<ApiResponse<ResumenDashboard>>(`${this.url}/resumen`).pipe(map((r) => r.data));
  }

  /** Ranking de los ultimos `dias` dias (por defecto 30). */
  materialesConMayorMovimiento(dias = 30, limite = 10): Observable<MaterialMovimiento[]> {
    const hasta = new Date();
    const desde = new Date(hasta.getTime() - dias * 86_400_000);
    const params = new HttpParams()
      .set('desde', aFechaIso(desde))
      .set('hasta', aFechaIso(hasta))
      .set('limite', limite);
    return this.http
      .get<ApiResponse<MaterialMovimiento[]>>(`${this.url}/materiales-mas-movimiento`, { params })
      .pipe(map((r) => r.data));
  }

  valorizacion(): Observable<Valorizacion> {
    return this.http.get<ApiResponse<Valorizacion>>(`${this.url}/valorizacion`).pipe(map((r) => r.data));
  }

  cumplimientoDespacho(): Observable<CumplimientoDespacho> {
    return this.http
      .get<ApiResponse<CumplimientoDespacho>>(`${this.url}/cumplimiento-despacho`)
      .pipe(map((r) => r.data));
  }
}

/** yyyy-MM-dd en hora local (formato ISO DATE que espera el backend). */
export function aFechaIso(fecha: Date): string {
  const mm = String(fecha.getMonth() + 1).padStart(2, '0');
  const dd = String(fecha.getDate()).padStart(2, '0');
  return `${fecha.getFullYear()}-${mm}-${dd}`;
}
