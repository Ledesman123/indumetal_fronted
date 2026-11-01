import { Injectable, computed, inject, signal } from '@angular/core';
import { MovimientoService } from './movimiento.service';

export interface NotificacionSimulada {
  id: number;
  titulo: string;
  mensaje: string;
  fecha: string;
  leida: boolean;
  ruta?: string;
}

const CLAVE_LEIDAS = 'indumetal_notificaciones_leidas';

/**
 * RF-11: notificaciones de la campana del header, generadas a partir del
 * stock real del backend (materiales cuyo stock total esta bajo el minimo).
 * El estado "leida" se recuerda en el navegador.
 */
@Injectable({ providedIn: 'root' })
export class NotificacionesService {
  private movimientoService = inject(MovimientoService);

  private notificaciones = signal<NotificacionSimulada[]>([]);
  private leidas = new Set<number>(this.recuperarLeidas());
  private cargado = false;

  listar() {
    if (!this.cargado) this.refrescar();
    return this.notificaciones.asReadonly();
  }

  cantidadNoLeidas = computed(() => this.notificaciones().filter((n) => !n.leida).length);

  refrescar(): void {
    this.cargado = true;
    this.movimientoService.listarStock().subscribe({
      next: (stock) => {
        const porMaterial = new Map<number, { sku: string; nombre: string; total: number; minimo: number }>();
        for (const s of stock) {
          const actual = porMaterial.get(s.materialId);
          if (actual) actual.total += s.cantidad;
          else porMaterial.set(s.materialId, { sku: s.materialSku, nombre: s.materialNombre, total: s.cantidad, minimo: s.stockMinimo });
        }

        const ahora = new Date().toISOString();
        const lista: NotificacionSimulada[] = [...porMaterial.entries()]
          .filter(([, m]) => m.total < m.minimo)
          .map(([materialId, m]) => ({
            id: materialId,
            titulo: 'Stock bajo el mínimo',
            mensaje: `El material ${m.sku} (${m.nombre}) tiene ${m.total} y su mínimo es ${m.minimo}.`,
            fecha: ahora,
            leida: this.leidas.has(materialId),
            ruta: '/alertas'
          }));
        this.notificaciones.set(lista);
      },
      // Sin notificaciones si el backend no responde; no se interrumpe la navegacion.
      error: () => {
        this.cargado = false;
        this.notificaciones.set([]);
      }
    });
  }

  marcarComoLeida(id: number): void {
    this.leidas.add(id);
    this.guardarLeidas();
    this.notificaciones.update((lista) => lista.map((n) => (n.id === id ? { ...n, leida: true } : n)));
  }

  marcarTodasComoLeidas(): void {
    this.notificaciones().forEach((n) => this.leidas.add(n.id));
    this.guardarLeidas();
    this.notificaciones.update((lista) => lista.map((n) => ({ ...n, leida: true })));
  }

  private recuperarLeidas(): number[] {
    try {
      return JSON.parse(localStorage.getItem(CLAVE_LEIDAS) ?? '[]');
    } catch {
      return [];
    }
  }

  private guardarLeidas(): void {
    try {
      localStorage.setItem(CLAVE_LEIDAS, JSON.stringify([...this.leidas]));
    } catch {
      // almacenamiento no disponible: solo se pierde el estado "leida"
    }
  }
}
