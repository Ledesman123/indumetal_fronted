import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse, PageResponse } from '../models/api-response.model';
import {
  DevolucionRequest,
  IngresoRequest,
  MovimientoAlmacen,
  SalidaRequest,
  TransferenciaRequest
} from '../models/movimiento.model';
import { StockUbicacion } from '../models/stock.model';
import { KardexItem } from '../models/kardex.model';

/**
 * RF-06/07/08/09/10/17/18: movimientos, stock y kardex contra el backend
 * (/api/movimientos/*, /api/stock y /api/materiales/{id}/kardex).
 */
@Injectable({ providedIn: 'root' })
export class MovimientoService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/movimientos`;

  // ---------- RF-06 / RF-07: Ingreso (ubicacionId null = asignacion automatica) ----------

  registrarIngreso(request: IngresoRequest): Observable<MovimientoAlmacen> {
    return this.http
      .post<ApiResponse<MovimientoAlmacen>>(`${this.url}/ingresos`, request)
      .pipe(map((r) => r.data));
  }

  // ---------- RF-08: Salida ----------

  registrarSalida(request: SalidaRequest): Observable<MovimientoAlmacen> {
    return this.http
      .post<ApiResponse<MovimientoAlmacen>>(`${this.url}/salidas`, request)
      .pipe(map((r) => r.data));
  }

  // ---------- RF-17: Devolucion ----------

  registrarDevolucion(request: DevolucionRequest): Observable<MovimientoAlmacen> {
    const { motivo, ...resto } = request;
    return this.http
      .post<ApiResponse<MovimientoAlmacen>>(`${this.url}/devoluciones`, { ...resto, observaciones: motivo })
      .pipe(map((r) => r.data));
  }

  // ---------- RF-18: Transferencia (el backend genera salida + entrada) ----------

  registrarTransferencia(request: TransferenciaRequest): Observable<MovimientoAlmacen[]> {
    return this.http
      .post<ApiResponse<MovimientoAlmacen[]>>(`${this.url}/transferencias`, request)
      .pipe(map((r) => r.data));
  }

  // ---------- RF-10: Stock en tiempo real ----------

  listarStock(): Observable<StockUbicacion[]> {
    return this.http
      .get<ApiResponse<StockUbicacion[]>>(`${environment.apiUrl}/stock`)
      .pipe(map((r) => r.data));
  }

  // ---------- RF-09: Kardex de un material ----------

  listarKardex(materialId: number): Observable<KardexItem[]> {
    const params = new HttpParams().set('page', 0).set('size', 1000);
    return this.http
      .get<ApiResponse<PageResponse<KardexItem>>>(`${environment.apiUrl}/materiales/${materialId}/kardex`, { params })
      .pipe(map((r) => r.data.content));
  }

  /** Historial reciente (mas nuevo primero). */
  listarMovimientos(limite = 200): Observable<MovimientoAlmacen[]> {
    const params = new HttpParams().set('limite', limite);
    return this.http.get<ApiResponse<MovimientoAlmacen[]>>(this.url, { params }).pipe(map((r) => r.data));
  }
}
