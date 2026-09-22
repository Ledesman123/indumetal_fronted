import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { DashboardService } from '../../core/services/dashboard.service';
import {
  CumplimientoDespacho,
  MaterialMovimiento,
  ResumenDashboard,
  Valorizacion
} from '../../core/models/dashboard.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatProgressBarModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  private authService = inject(AuthService);
  private dashboardService = inject(DashboardService);

  nombreUsuario = this.authService.obtenerSesion()()?.nombreCompleto?.split(' ')[0] ?? '';

  resumen = signal<ResumenDashboard | null>(null);
  materialesTop = signal<MaterialMovimiento[]>([]);
  valorizacion = signal<Valorizacion | null>(null);
  cumplimiento = signal<CumplimientoDespacho | null>(null);
  cargando = signal(true);

  ngOnInit(): void {
    this.dashboardService.resumen().subscribe((r) => this.resumen.set(r));
    this.dashboardService.materialesConMayorMovimiento().subscribe((m) => this.materialesTop.set(m));
    this.dashboardService.valorizacion().subscribe((v) => {
      this.valorizacion.set(v);
      this.cargando.set(false);
    });
    this.dashboardService.cumplimientoDespacho().subscribe((c) => this.cumplimiento.set(c));
  }

  etiquetaCategoria(categoria: string): string {
    return categoria.replace('_', ' ');
  }

  porcentajeDeCategoria(valor: number): number {
    const total = this.valorizacion()?.valorizacionTotal ?? 1;
    return (valor / total) * 100;
  }

  maxMovimientos(): number {
    return Math.max(...this.materialesTop().map((m) => m.cantidadMovimientos), 1);
  }
}