import { Injectable, inject, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { ActualizarPerfilRequest, PerfilUsuario } from '../models/perfil.model';

/**
 * TEMPORAL (Sprint 2): datos de perfil en memoria, sembrados con lo que ya
 * hay en la sesion. En Sprint 3 esto se reemplaza por HttpClient contra
 * /api/usuarios/me (o el endpoint que exponga el backend para el propio perfil).
 */
@Injectable({ providedIn: 'root' })
export class PerfilService {
  private authService = inject(AuthService);

  private perfil = signal<PerfilUsuario>(this.construirPerfilInicial());

  obtenerPerfil() {
    return this.perfil.asReadonly();
  }

  actualizar(request: ActualizarPerfilRequest): Observable<PerfilUsuario> {
    const actualizado: PerfilUsuario = {
      ...this.perfil(),
      nombres: request.nombres,
      apellidos: request.apellidos,
      telefono: request.telefono
    };

    return of(actualizado).pipe(
      delay(500),
      tap((perfil) => {
        this.perfil.set(perfil);
        this.authService.actualizarNombreEnSesion(`${perfil.nombres} ${perfil.apellidos}`.trim());
      })
    );
  }

  /** TEMPORAL (Sprint 2): simulado. En Sprint 3 valida la contrasena actual contra el backend. */
  cambiarPassword(passwordActual: string, passwordNueva: string): Observable<void> {
    return of(void 0).pipe(delay(600));
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
      codigoEmpleado: '—'
    };
  }
}