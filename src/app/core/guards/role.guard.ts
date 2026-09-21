import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Uso en las rutas: { path: 'usuarios', canActivate: [roleGuard(['ADMINISTRADOR'])], ... }
 */
export const roleGuard = (rolesPermitidos: string[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const rolActual = authService.obtenerRol();
    if (rolActual && rolesPermitidos.includes(rolActual)) {
      return true;
    }

    router.navigate(['/acceso-denegado']);
    return false;
  };
};