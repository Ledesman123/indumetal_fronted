import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { AuthService } from '../../core/services/auth.service';
import { NotificacionesService, NotificacionSimulada } from '../../core/services/notificaciones.service';
import { MENU_POR_ROL } from '../menu.config';
import { MenuItem } from '../menu-item.model';
import { ROLES_DISPONIBLES } from '../../core/models/usuario.model';
import { PREGUNTAS_FRECUENTES, PreguntaFrecuente } from '../ayuda-contenido';

const RUTAS_PRIORITARIAS_TELEFONO = ['/dashboard', '/movimientos', '/stock', '/materiales'];
const MAX_ITEMS_BARRA = 5;

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatTooltipModule,
    MatBadgeModule
  ],
  templateUrl: './app-layout.html',
  styleUrl: './app-layout.scss'
})
export class AppLayout {
  authService = inject(AuthService);
  private notificacionesService = inject(NotificacionesService);
  private breakpoint = inject(BreakpointObserver);
  private router = inject(Router);

  esMovil = signal(false);
  esTelefono = signal(false);
  sidebarAbierto = signal(true);
  masAbierto = signal(false);

  notificaciones = this.notificacionesService.listar();
  cantidadNoLeidas = this.notificacionesService.cantidadNoLeidas;

  preguntasFrecuentes: PreguntaFrecuente[] = PREGUNTAS_FRECUENTES;
  faqAbierta = signal<number | null>(null);

  constructor() {
    this.breakpoint
      .observe('(max-width: 900px)')
      .pipe(takeUntilDestroyed())
      .subscribe((estado) => {
        this.esMovil.set(estado.matches);
        this.sidebarAbierto.set(!estado.matches);
      });

    this.breakpoint
      .observe('(max-width: 600px)')
      .pipe(takeUntilDestroyed())
      .subscribe((estado) => {
        this.esTelefono.set(estado.matches);
        if (!estado.matches) this.masAbierto.set(false);
      });
  }

  get menuActual(): MenuItem[] {
    const rol = this.authService.obtenerRol();
    return rol ? (MENU_POR_ROL[rol] ?? []) : [];
  }

  get sesion() {
    return this.authService.obtenerSesion()();
  }

  etiquetaRol(rol: string | null | undefined): string {
    return ROLES_DISPONIBLES.find((r) => r.valor === rol)?.etiqueta ?? rol ?? '';
  }

  get itemsBarra(): MenuItem[] {
    const menu = this.menuActual;
    if (menu.length <= MAX_ITEMS_BARRA) return menu;

    const prioritarios = RUTAS_PRIORITARIAS_TELEFONO
      .map((ruta) => menu.find((item) => item.ruta === ruta))
      .filter((item): item is MenuItem => !!item);
    const resto = menu.filter((item) => !prioritarios.includes(item));

    return [...prioritarios, ...resto].slice(0, MAX_ITEMS_BARRA - 1);
  }

  get itemsMas(): MenuItem[] {
    const menu = this.menuActual;
    if (menu.length <= MAX_ITEMS_BARRA) return [];
    const enBarra = this.itemsBarra;
    return menu.filter((item) => !enBarra.includes(item));
  }
    get accesosRapidos(): MenuItem[] {
    return this.menuActual;
  }

  get masActivo(): boolean {
    return this.itemsMas.some((item) =>
      this.router.isActive(item.ruta, {
        paths: 'subset',
        queryParams: 'ignored',
        fragment: 'ignored',
        matrixParams: 'ignored'
      })
    );
  }

  toggleSidebar(): void {
    this.sidebarAbierto.update((abierto) => !abierto);
  }

  cerrarEnMovil(): void {
    if (this.esMovil()) this.sidebarAbierto.set(false);
  }

  toggleMas(): void {
    this.masAbierto.update((abierto) => !abierto);
  }

  cerrarMas(): void {
    this.masAbierto.set(false);
  }

  cerrarSesionDesdeMas(): void {
    this.cerrarMas();
    this.authService.logout();
  }

  irANotificacion(notificacion: NotificacionSimulada): void {
    this.notificacionesService.marcarComoLeida(notificacion.id);
    if (notificacion.ruta) this.router.navigate([notificacion.ruta]);
  }

  marcarTodasComoLeidas(): void {
    this.notificacionesService.marcarTodasComoLeidas();
  }

  toggleFaq(id: number): void {
    this.faqAbierta.set(this.faqAbierta() === id ? null : id);
  }
}