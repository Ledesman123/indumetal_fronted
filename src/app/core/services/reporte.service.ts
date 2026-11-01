import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { aFechaIso } from './dashboard.service';

export type FormatoReporte = 'pdf' | 'excel';

/** RF-15: descarga de reportes PDF/Excel generados por el backend (/api/reportes/*). */
@Injectable({ providedIn: 'root' })
export class ReporteService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/reportes`;

  movimientos(formato: FormatoReporte, desde: Date, hasta: Date, materialId: number | null): Observable<void> {
    let params = new HttpParams().set('desde', aFechaIso(desde)).set('hasta', aFechaIso(hasta));
    if (materialId) params = params.set('materialId', materialId);
    const nombre = `movimientos_${aFechaIso(desde)}_${aFechaIso(hasta)}.${extension(formato)}`;
    return this.descargar(`${this.url}/movimientos/${formato}`, nombre, params);
  }

  kardex(formato: FormatoReporte, materialId: number, sku: string): Observable<void> {
    return this.descargar(`${this.url}/kardex/${materialId}/${formato}`, `kardex_${sku}.${extension(formato)}`);
  }

  stock(): Observable<void> {
    return this.descargar(`${this.url}/stock/excel`, `stock_actual_${aFechaIso(new Date())}.xlsx`);
  }

  private descargar(url: string, nombreArchivo: string, params?: HttpParams): Observable<void> {
    return this.http.get(url, { params, responseType: 'blob' }).pipe(
      map((blob) => {
        const enlace = document.createElement('a');
        enlace.href = URL.createObjectURL(blob);
        enlace.download = nombreArchivo;
        enlace.click();
        setTimeout(() => URL.revokeObjectURL(enlace.href), 1000);
      })
    );
  }
}

function extension(formato: FormatoReporte): string {
  return formato === 'pdf' ? 'pdf' : 'xlsx';
}
