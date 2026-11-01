import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Usuario } from '../models/usuario.model';
import { AuthService } from './auth.service';
import { ActualizarPerfilRequest, PerfilUsuario } from '../models/perfil.model';

const CLAVE_EXTRAS = 'indumetal_perfil_extras';

/** Datos que el backend aun no guarda; se conservan en este navegador por usuario. */
interface ExtrasPerfil {
  telefono: string;
  fotoUrl: string | null;
}

/**
 * Perfil del usuario autenticado contra /api/perfil (nombres, apellidos,
 * correo, rol y cambio de contrasena). Telefono y foto se guardan solo en
 * el navegador hasta que el backend tenga columnas para ellos.
 */
@Injectable({ providedIn: 'root' })
export class PerfilService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private url = `${environment.apiUrl}/perfil`;

  private perfil = signal<PerfilUsuario>(this.construirPerfilInicial());

  /** Devuelve el perfil (inicialmente con lo que hay en la sesion) y lo refresca desde el backend. */
  obtenerPerfil() {
    // Se reconstruye por si cambio el usuario de la sesion (logout + login con otra cuenta).
    this.perfil.set(this.construirPerfilInicial());
    this.http.get<ApiResponse<Usuario>>(this.url).subscribe({
      next: (r) => this.perfil.update((p) => ({ ...p, ...this.desdeUsuario(r.data) })),
      error: () => {}
    });
    return this.perfil.asReadonly();
  }

  actualizar(request: ActualizarPerfilRequest): Observable<PerfilUsuario> {
    const body = { nombres: request.nombres, apellidos: request.apellidos };
    return this.http.put<ApiResponse<Usuario>>(this.url, body).pipe(
      map((r) => ({
        ...this.perfil(),
        ...this.desdeUsuario(r.data),
        telefono: request.telefono,
        fotoUrl: request.fotoUrl !== undefined ? request.fotoUrl : this.perfil().fotoUrl
      })),
      tap((perfil) => {
        this.perfil.set(perfil);
        this.guardarExtras({ telefono: perfil.telefono, fotoUrl: perfil.fotoUrl });
        this.authService.actualizarNombreEnSesion(`${perfil.nombres} ${perfil.apellidos}`.trim());
      })
    );
  }

  cambiarPassword(passwordActual: string, passwordNueva: string): Observable<void> {
    return this.http
      .put<ApiResponse<void>>(`${this.url}/password`, { passwordActual, passwordNueva })
      .pipe(map(() => void 0));
  }

  private desdeUsuario(u: Usuario): Pick<PerfilUsuario, 'nombres' | 'apellidos' | 'correo' | 'rol' | 'codigoEmpleado'> {
    return {
      nombres: u.nombres,
      apellidos: u.apellidos,
      correo: u.correo,
      rol: u.rol,
      codigoEmpleado: `EMP-${String(u.id).padStart(4, '0')}`
    };
  }

  private construirPerfilInicial(): PerfilUsuario {
    const sesion = this.authService.obtenerSesion()();
    const partes = (sesion?.nombreCompleto ?? '').trim().split(' ');
    const extras = this.recuperarExtras();
    return {
      nombres: partes[0] ?? '',
      apellidos: partes.slice(1).join(' '),
      correo: sesion?.correo ?? '',
      telefono: extras.telefono,
      rol: sesion?.rol ?? '',
      codigoEmpleado: '—',
      fotoUrl: extras.fotoUrl
    };
  }

  private claveExtras(): string {
    return `${CLAVE_EXTRAS}_${this.authService.obtenerSesion()()?.usuarioId ?? 'anon'}`;
  }

  private recuperarExtras(): ExtrasPerfil {
    try {
      const guardado = localStorage.getItem(this.claveExtras());
      return guardado ? JSON.parse(guardado) : { telefono: '', fotoUrl: null };
    } catch {
      return { telefono: '', fotoUrl: null };
    }
  }

  private guardarExtras(extras: ExtrasPerfil): void {
    try {
      localStorage.setItem(this.claveExtras(), JSON.stringify(extras));
    } catch {
      // foto demasiado grande para localStorage u almacenamiento bloqueado: se conserva solo en memoria
    }
  }
}
