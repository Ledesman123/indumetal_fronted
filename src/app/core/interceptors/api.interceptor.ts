import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

/**
 * Para toda peticion al backend:
 *  1) agrega el header "Authorization: Bearer <token>" si hay sesion,
 *  2) si el backend responde 401 (token vencido/invalido) cierra la sesion,
 *  3) convierte el error HTTP en un Error con el mensaje del ApiResponse,
 *     asi los componentes pueden seguir usando "err.message" directamente.
 */
export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const esApi = req.url.startsWith(environment.apiUrl);
  const esAuth = req.url.startsWith(`${environment.apiUrl}/auth/`);

  const token = authService.obtenerToken();
  const peticion = esApi && token && !esAuth
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(peticion).pipe(
    catchError((error: HttpErrorResponse) => {
      if (esApi && !esAuth && error.status === 401) {
        authService.logout();
      }
      return throwError(() => new Error(extraerMensaje(error)));
    })
  );
};

function extraerMensaje(error: HttpErrorResponse): string {
  if (error.status === 0) {
    return 'No se pudo conectar con el servidor. Verifica tu conexión o intenta más tarde.';
  }

  const cuerpo = error.error;
  if (cuerpo && typeof cuerpo === 'object') {
    // Errores de validacion (@Valid): data = { campo: mensaje }
    if (cuerpo.data && typeof cuerpo.data === 'object' && !Array.isArray(cuerpo.data)) {
      const detalles = Object.entries(cuerpo.data).map(([campo, msg]) => `${campo}: ${msg}`);
      if (detalles.length) return `${cuerpo.message ?? 'Error de validación'} (${detalles.join(', ')})`;
    }
    if (cuerpo.message) return cuerpo.message;
  }

  switch (error.status) {
    case 401: return 'Tu sesión expiró. Inicia sesión nuevamente.';
    case 403: return 'No tienes permisos para realizar esta acción.';
    case 404: return 'Recurso no encontrado.';
    default: return 'Ocurrió un error inesperado en el servidor.';
  }
}
