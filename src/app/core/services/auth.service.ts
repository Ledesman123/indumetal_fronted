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
const CODIGO_DEMO = '123456'; // TEMPORAL Sprint 2: unico codigo "valido" mientras no hay backend conectado
const TOKEN_RESET_DEMO = 'reset-token-simulado';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private sesionActual = signal<LoginResponse | null>(this.recuperarSesionGuardada());

  constructor(private router: Router) {}

  /**
   * TEMPORAL (Sprint 2): simula el login sin llamar al backend todavia.
   * En el Sprint 3 esto se reemplaza por una llamada real con HttpClient
   * a POST /api/auth/login, pero la firma del metodo se mantiene igual,
   * asi que nada de lo que consuma este service tiene que cambiar.
   */
  login(request: LoginRequest): Observable<LoginResponse> {
    const respuestaSimulada: LoginResponse = {
      token: 'token-simulado-sprint-2',
      tipo: 'Bearer',
      usuarioId: 1,
      nombreCompleto: 'Administrador General',
      rol: this.inferirRolDeCorreo(request.correo)
    };

    return of(respuestaSimulada).pipe(
      delay(600),
      tap((respuesta) => this.guardarSesion(respuesta))
    );
  }

  /** TEMPORAL (Sprint 2): simula el paso 1 de "olvide mi password". */
  solicitarCodigo(correo: string): Observable<string> {
    return of('Si el correo esta registrado, se enviara un codigo de verificacion.').pipe(
      delay(700)
    );
  }

  /** TEMPORAL (Sprint 2): simula el paso 2. En la demo, el codigo valido es 123456. */
  verificarCodigo(correo: string, codigo: string): Observable<VerifyResetCodeResponse> {
    if (codigo !== CODIGO_DEMO) {
      return throwError(() => new Error('Codigo o token invalido o expirado.')).pipe(delay(500));
    }
    return of({ resetToken: TOKEN_RESET_DEMO, expiraEnMinutos: 10 }).pipe(delay(500));
  }

  /** TEMPORAL (Sprint 2): simula el paso 3. */
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