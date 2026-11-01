import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Ubicacion, UbicacionRequest } from '../models/ubicacion.model';

/** Forma en que el backend serializa la entidad Ubicacion (con el almacen anidado). */
interface UbicacionApi {
  id: number;
  codigo: string;
  activo: boolean;
  almacen: { id: number };
}

/** RF-05 / RF-07: ubicaciones fisicas contra /api/ubicaciones. */
@Injectable({ providedIn: 'root' })
export class UbicacionService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/ubicaciones`;

  listarPorAlmacen(almacenId: number): Observable<Ubicacion[]> {
    return this.http
      .get<ApiResponse<UbicacionApi[]>>(`${this.url}/por-almacen/${almacenId}`)
      .pipe(map((r) => r.data.map(aUbicacion)));
  }

  /** Todas las ubicaciones activas de todos los almacenes. */
  listarActivas(): Observable<Ubicacion[]> {
    return this.http.get<ApiResponse<UbicacionApi[]>>(this.url).pipe(map((r) => r.data.map(aUbicacion)));
  }

  crear(request: UbicacionRequest): Observable<Ubicacion> {
    return this.http.post<ApiResponse<UbicacionApi>>(this.url, request).pipe(map((r) => aUbicacion(r.data)));
  }

  actualizar(id: number, request: UbicacionRequest): Observable<Ubicacion> {
    return this.http
      .put<ApiResponse<UbicacionApi>>(`${this.url}/${id}`, request)
      .pipe(map((r) => aUbicacion(r.data)));
  }

  desactivar(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.url}/${id}`).pipe(map(() => void 0));
  }
}

function aUbicacion(u: UbicacionApi): Ubicacion {
  return { id: u.id, codigo: u.codigo, almacenId: u.almacen?.id, activo: u.activo };
}
