import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Almacen, AlmacenRequest } from '../models/almacen.model';

/** RF-05: gestion de almacenes contra /api/almacenes. */
@Injectable({ providedIn: 'root' })
export class AlmacenService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/almacenes`;

  listar(): Observable<Almacen[]> {
    return this.http.get<ApiResponse<Almacen[]>>(this.url).pipe(map((r) => r.data));
  }

  crear(request: AlmacenRequest): Observable<Almacen> {
    return this.http.post<ApiResponse<Almacen>>(this.url, request).pipe(map((r) => r.data));
  }

  actualizar(id: number, request: AlmacenRequest): Observable<Almacen> {
    return this.http.put<ApiResponse<Almacen>>(`${this.url}/${id}`, request).pipe(map((r) => r.data));
  }

  desactivar(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.url}/${id}`).pipe(map(() => void 0));
  }
}
