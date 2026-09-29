import { Injectable, computed, signal } from '@angular/core';

export interface NotificacionSimulada {
  id: number;
  titulo: string;
  mensaje: string;
  fecha: string;
  leida: boolean;
  ruta?: string;
}

/**
 * TEMPORAL (Sprint 2): notificaciones de ejemplo en memoria. En Sprint 3 esto
 * se reemplaza por HttpClient consultando el backend (alertas de stock,
 * resultado de movimientos, etc.), manteniendo la misma forma de datos.
 */
@Injectable({ providedIn: 'root' })
export class NotificacionesService {
  private notificaciones = signal<NotificacionSimulada[]>([
    {
      id: 1,
      titulo: 'Stock bajo el mínimo',
      mensaje: 'El material INS-0012 (Electrodo E6011 1/8") está por debajo de su stock mínimo.',
      fecha: new Date().toISOString(),
      leida: false,
      ruta: '/alertas'
    },
    {
      id: 2,
      titulo: 'Inventario físico pendiente',
      mensaje: 'Hay un inventario físico en proceso sin conteo completo.',
      fecha: new Date(Date.now() - 3_600_000).toISOString(),
      leida: false,
      ruta: '/inventario-fisico'
    },
    {
      id: 3,
      titulo: 'Nuevo usuario creado',
      mensaje: 'Se registró un nuevo usuario en el sistema.',
      fecha: new Date(Date.now() - 86_400_000).toISOString(),
      leida: true,
      ruta: '/usuarios'
    }
  ]);

  listar() {
    return this.notificaciones.asReadonly();
  }

  cantidadNoLeidas = computed(() => this.notificaciones().filter((n) => !n.leida).length);

  marcarComoLeida(id: number): void {
    this.notificaciones.update((lista) => lista.map((n) => (n.id === id ? { ...n, leida: true } : n)));
  }

  marcarTodasComoLeidas(): void {
    this.notificaciones.update((lista) => lista.map((n) => ({ ...n, leida: true })));
  }
}