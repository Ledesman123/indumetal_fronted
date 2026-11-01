import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Usuario, UsuarioRequest } from '../models/usuario.model';

/** RF-03: administracion de usuarios contra /api/usuarios (solo Administrador). */
@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/usuarios`;

  listar(): Observable<Usuario[]> {
    return this.http.get<ApiResponse<Usuario[]>>(this.url).pipe(map((r) => r.data));
  }

  crear(request: UsuarioRequest): Observable<Usuario> {
    return this.http.post<ApiResponse<Usuario>>(this.url, request).pipe(map((r) => r.data));
  }

  actualizar(id: number, request: UsuarioRequest): Observable<Usuario> {
    return this.http.put<ApiResponse<Usuario>>(`${this.url}/${id}`, request).pipe(map((r) => r.data));
  }

  cambiarEstado(id: number, activo: boolean): Observable<void> {
    const params = new HttpParams().set('activo', activo);
    return this.http
      .patch<ApiResponse<Usuario>>(`${this.url}/${id}/estado`, null, { params })
      .pipe(map(() => void 0));
  }
}
