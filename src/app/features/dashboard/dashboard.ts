import { Component, inject } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, MatCardModule, RouterLink],
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
      <div class="tarjetas">
        <a mat-card class="tarjeta-modulo" routerLink="/materiales">
          <mat-icon>category</mat-icon>
          <span>Materiales</span>
        </a>
      </div>
    </div>
  `,
  styles: [`
    .titulo { margin-left: 12px; font-weight: 500; }
    .espaciador { flex: 1 1 auto; }
    .rol { margin-right: 16px; font-size: 13px; }
    .contenido { padding: 32px; }
    .tarjetas { display: flex; gap: 16px; margin-top: 16px; }
    .tarjeta-modulo {
      display: flex; flex-direction: column; align-items: center; gap: 8px;
      padding: 24px; width: 120px; cursor: pointer; text-decoration: none; color: inherit;
      border-radius: 8px; transition: box-shadow 0.2s;
    }
    .tarjeta-modulo:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
  `]
})
export class Dashboard {
  authService = inject(AuthService);
}