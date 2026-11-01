import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse, PageResponse } from '../models/api-response.model';
import { Material, MaterialRequest } from '../models/material.model';

/** RF-04 / RF-16: CRUD y busqueda de materiales contra /api/materiales. */
@Injectable({ providedIn: 'root' })
export class MaterialService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/materiales`;

  listar(): Observable<Material[]> {
    return this.buscar('', null);
  }

  // El backend solo devuelve materiales activos y pagina; se pide una pagina amplia.
  buscar(termino: string, categoria: string | null): Observable<Material[]> {
    let params = new HttpParams().set('page', 0).set('size', 1000).set('sort', 'nombre');
    if (termino) params = params.set('texto', termino);
    if (categoria) params = params.set('categoria', categoria);

    return this.http
      .get<ApiResponse<PageResponse<Material>>>(this.url, { params })
      .pipe(map((r) => r.data.content));
  }

  obtenerPorId(id: number): Observable<Material> {
    return this.http.get<ApiResponse<Material>>(`${this.url}/${id}`).pipe(map((r) => r.data));
  }

  crear(request: MaterialRequest): Observable<Material> {
    return this.http.post<ApiResponse<Material>>(this.url, request).pipe(map((r) => r.data));
  }

  actualizar(id: number, request: MaterialRequest): Observable<Material> {
    return this.http.put<ApiResponse<Material>>(`${this.url}/${id}`, request).pipe(map((r) => r.data));
  }

  desactivar(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.url}/${id}`).pipe(map(() => void 0));
  }
}
