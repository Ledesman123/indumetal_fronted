import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import {
  LoginRequest,
  LoginResponse,
  VerifyResetCodeResponse
} from '../models/auth.model';

const CLAVE_SESION = 'indumetal_sesion';

/** RF-01: autenticacion JWT contra /api/auth/* del backend. */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private url = `${environment.apiUrl}/auth`;

  private sesionActual = signal<LoginResponse | null>(this.recuperarSesionGuardada());

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<ApiResponse<Omit<LoginResponse, 'correo'>>>(`${this.url}/login`, request).pipe(
      // El backend no devuelve el correo en la respuesta; se guarda el usado al iniciar sesion.
      map((r) => ({ ...r.data, correo: request.correo })),
      tap((respuesta) => this.guardarSesion(respuesta))
    );
  }

  solicitarCodigo(correo: string): Observable<string> {
    return this.http
      .post<ApiResponse<void>>(`${this.url}/forgot-password`, { correo })
      .pipe(map((r) => r.message));
  }

  verificarCodigo(correo: string, codigo: string): Observable<VerifyResetCodeResponse> {
    return this.http
      .post<ApiResponse<VerifyResetCodeResponse>>(`${this.url}/verify-reset-code`, { correo, codigo })
      .pipe(map((r) => r.data));
  }

  resetearPassword(correo: string, resetToken: string, nuevaPassword: string): Observable<void> {
    return this.http
      .post<ApiResponse<void>>(`${this.url}/reset-password`, { correo, resetToken, nuevaPassword })
      .pipe(map(() => void 0));
  }

  logout(): void {
    localStorage.removeItem(CLAVE_SESION);
    this.sesionActual.set(null);
    this.router.navigate(['/login']);
  }

  estaAutenticado(): boolean {
    const sesion = this.sesionActual();
    if (!sesion) return false;
    if (this.tokenExpirado(sesion.token)) {
      localStorage.removeItem(CLAVE_SESION);
      this.sesionActual.set(null);
      return false;
    }
    return true;
  }

  obtenerToken(): string | null {
    return this.sesionActual()?.token ?? null;
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
    try {
      const guardada = localStorage.getItem(CLAVE_SESION);
      return guardada ? JSON.parse(guardada) : null;
    } catch {
      return null;
    }
  }

  /** Lee el "exp" del JWT (sin validar firma; eso lo hace el backend) para no usar tokens vencidos. */
  private tokenExpirado(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      return typeof payload.exp === 'number' && payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }
}
