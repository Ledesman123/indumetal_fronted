import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { AuthService } from './auth.service';
import { ActualizarPerfilRequest, PerfilUsuario } from '../models/perfil.model';

/** Forma en que el backend devuelve el perfil (PerfilController.PerfilResponse). */
interface PerfilApi {
  id: number;
  nombres: string;
  apellidos: string;
  correo: string;
  rol: string;
  telefono: string | null;
  fotoUrl: string | null;
}

/** Perfil del usuario autenticado contra /api/perfil (datos, foto y cambio de contrasena). */
@Injectable({ providedIn: 'root' })
export class PerfilService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private url = `${environment.apiUrl}/perfil`;

  private perfil = signal<PerfilUsuario>(this.construirPerfilInicial());

  /** Foto actual (o null), usada por el avatar del header. */
  foto = computed(() => this.perfil().fotoUrl);

  /** Devuelve el perfil (inicialmente con lo que hay en la sesion) y lo refresca desde el backend. */
  obtenerPerfil() {
    // Se reconstruye por si cambio el usuario de la sesion (logout + login con otra cuenta).
    this.perfil.set(this.construirPerfilInicial());
    this.http.get<ApiResponse<PerfilApi>>(this.url).subscribe({
      next: (r) => this.aplicar(r.data),
      error: () => {}
    });
    return this.perfil.asReadonly();
  }

  actualizar(request: ActualizarPerfilRequest): Observable<PerfilUsuario> {
    const body = {
      nombres: request.nombres,
      apellidos: request.apellidos,
      telefono: request.telefono || null,
      fotoUrl: request.fotoUrl !== undefined ? request.fotoUrl : this.perfil().fotoUrl
    };
    return this.http.put<ApiResponse<PerfilApi>>(this.url, body).pipe(
      tap((r) => this.aplicar(r.data)),
      map(() => this.perfil())
    );
  }

  cambiarPassword(passwordActual: string, passwordNueva: string): Observable<void> {
    return this.http
      .put<ApiResponse<void>>(`${this.url}/password`, { passwordActual, passwordNueva })
      .pipe(map(() => void 0));
  }

  private aplicar(p: PerfilApi): void {
    this.perfil.set({
      nombres: p.nombres,
      apellidos: p.apellidos,
      correo: p.correo,
      telefono: p.telefono ?? '',
      rol: p.rol,
      codigoEmpleado: `EMP-${String(p.id).padStart(4, '0')}`,
      fotoUrl: p.fotoUrl
    });
    this.authService.actualizarNombreEnSesion(`${p.nombres} ${p.apellidos}`.trim());
  }

  private construirPerfilInicial(): PerfilUsuario {
    const sesion = this.authService.obtenerSesion()();
    const partes = (sesion?.nombreCompleto ?? '').trim().split(' ');
    return {
      nombres: partes[0] ?? '',
      apellidos: partes.slice(1).join(' '),
      correo: sesion?.correo ?? '',
      telefono: '',
      rol: sesion?.rol ?? '',
      codigoEmpleado: '—',
      fotoUrl: null
    };
  }
}
