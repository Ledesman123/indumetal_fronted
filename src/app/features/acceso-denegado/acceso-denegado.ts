import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-acceso-denegado',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, RouterLink],
  template: `
    <div class="contenedor-denegado">
      <mat-icon>block</mat-icon>
      <h2>Acceso denegado</h2>
      <p>Tu rol no tiene permiso para ver esta sección.</p>
      <button mat-flat-button color="primary" routerLink="/dashboard">Volver al panel</button>
    </div>
  `,
  styles: [`
    .contenedor-denegado {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      padding: 60px 20px;
      text-align: center;
      color: #666;
    }
    mat-icon { font-size: 56px; width: 56px; height: 56px; color: #b3261e; margin-bottom: 12px; }
    h2 { margin: 0 0 6px; color: #1a1f2b; }
    p { margin: 0 0 20px; }
  `]
})
export class AccesoDenegado {}