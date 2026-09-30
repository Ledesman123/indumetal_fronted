import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import {
  LoginRequest,
  LoginResponse,
  VerifyResetCodeResponse
} from '../models/auth.model';

const CLAVE_SESION = 'indumetal_sesion';
const CODIGO_DEMO = '123456';
const TOKEN_RESET_DEMO = 'reset-token-simulado';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private sesionActual = signal<LoginResponse | null>(this.recuperarSesionGuardada());

  constructor(private router: Router) {}

  login(request: LoginRequest): Observable<LoginResponse> {
    const respuestaSimulada: LoginResponse = {
      token: 'token-simulado-sprint-2',
      tipo: 'Bearer',
      usuarioId: 1,
      nombreCompleto: 'Administrador General',
      correo: request.correo,
      rol: this.inferirRolDeCorreo(request.correo)
    };

    return of(respuestaSimulada).pipe(
      delay(600),
      tap((respuesta) => this.guardarSesion(respuesta))
    );
  }

  solicitarCodigo(correo: string): Observable<string> {
    return of('Si el correo esta registrado, se enviara un codigo de verificacion.').pipe(
      delay(700)
    );
  }

  verificarCodigo(correo: string, codigo: string): Observable<VerifyResetCodeResponse> {
    if (codigo !== CODIGO_DEMO) {
      return throwError(() => new Error('Codigo o token invalido o expirado.')).pipe(delay(500));
    }
    return of({ resetToken: TOKEN_RESET_DEMO, expiraEnMinutos: 10 }).pipe(delay(500));
  }

  resetearPassword(correo: string, resetToken: string, nuevaPassword: string): Observable<void> {
    if (resetToken !== TOKEN_RESET_DEMO) {
      return throwError(() => new Error('Codigo o token invalido o expirado.')).pipe(delay(500));
    }
    return of(void 0).pipe(delay(500));
  }

  logout(): void {
    localStorage.removeItem(CLAVE_SESION);
    this.sesionActual.set(null);
    this.router.navigate(['/login']);
  }

  estaAutenticado(): boolean {
    return this.sesionActual() !== null;
  }

  obtenerRol(): string | null {
    return this.sesionActual()?.rol ?? null;
  }

  obtenerSesion() {
    return this.sesionActual.asReadonly();
  }

  /** Actualiza el nombre mostrado en el header/menus tras editar el perfil (ver PerfilService). */
  actualizarNombreEnSesion(nombreCompleto: string): void {
    const actual = this.sesionActual();
    if (!actual) return;
    const actualizada: LoginResponse = { ...actual, nombreCompleto };
    localStorage.setItem(CLAVE_SESION, JSON.stringify(actualizada));
    this.sesionActual.set(actualizada);
  }

  private guardarSesion(respuesta: LoginResponse): void {
    localStorage.setItem(CLAVE_SESION, JSON.stringify(respuesta));
    this.sesionActual.set(respuesta);
  }

  private recuperarSesionGuardada(): LoginResponse | null {
    const guardada = localStorage.getItem(CLAVE_SESION);
    return guardada ? JSON.parse(guardada) : null;
  }

  private inferirRolDeCorreo(correo: string): string {
    if (correo.includes('admin')) return 'ADMINISTRADOR';
    if (correo.includes('supervisor')) return 'SUPERVISOR_ALMACEN';
    if (correo.includes('jefe')) return 'JEFE_PRODUCCION';
    return 'ALMACENERO';
  }
}