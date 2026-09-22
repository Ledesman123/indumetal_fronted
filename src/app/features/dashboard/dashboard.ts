import { Component, inject } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule, MatIconModule],
  template: `
    <mat-toolbar color="primary">
      <mat-icon>inventory_2</mat-icon>
      <span class="titulo">INDUMETAL PERÚ - Gestión de Almacén</span>
      <span class="espaciador"></span>
      <span class="rol">{{ authService.obtenerSesion()()?.nombreCompleto }} ({{ authService.obtenerRol() }})</span>
      <button mat-icon-button (click)="authService.logout()" title="Cerrar sesión">
        <mat-icon>logout</mat-icon>
      </button>
    </mat-toolbar>

    <div class="contenido">
      <h2>Bienvenido al panel de INDUMETAL</h2>
      <p>Este es un placeholder. Aquí irán los módulos: materiales, movimientos, kardex, dashboard de indicadores, reportes, etc.</p>
    </div>
  `,
  styles: [`
    .titulo { margin-left: 12px; font-weight: 500; }
    .espaciador { flex: 1 1 auto; }
    .rol { margin-right: 16px; font-size: 13px; }
    .contenido { padding: 32px; }
  `]
})
export class Dashboard {
  authService = inject(AuthService);
}