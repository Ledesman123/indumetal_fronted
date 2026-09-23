import { Injectable, inject, signal } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, map, switchMap } from 'rxjs/operators';
import { InventarioFisico, ItemInventarioFisico } from '../models/inventario-fisico.model';
import { MovimientoService } from './movimiento.service';
import { AuthService } from './auth.service';

/**
 * TEMPORAL (Sprint 2): simula RF-12 en memoria. En Sprint 3 esto se
 * reemplaza por HttpClient contra /api/inventarios-fisicos.
 */
@Injectable({ providedIn: 'root' })
export class InventarioFisicoService {
  private movimientoService = inject(MovimientoService);
  private authService = inject(AuthService);

  private inventarios = signal<InventarioFisico[]>([]);
  private siguienteId = 1;

  listar(): Observable<InventarioFisico[]> {
    const lista = [...this.inventarios()].sort((a, b) => b.fechaInicio.localeCompare(a.fechaInicio));
    return of(lista).pipe(delay(400));
  }

  obtenerPorId(id: number): Observable<InventarioFisico> {
    const encontrado = this.inventarios().find((i) => i.id === id);
    if (!encontrado) return throwError(() => new Error('Inventario no encontrado')).pipe(delay(300));
    return of(encontrado).pipe(delay(300));
  }

  // Toma la "foto" del stock actual y crea el inventario en estado EN_PROCESO.
  iniciar(): Observable<InventarioFisico> {
    return this.movimientoService.listarStock().pipe(
      delay(500),
      map((stockActual) => {
        const items: ItemInventarioFisico[] = stockActual.map((s) => ({
          materialId: s.materialId,
          materialSku: s.materialSku,
          materialNombre: s.materialNombre,
          ubicacionId: s.ubicacionId,
          ubicacionCodigo: s.ubicacionCodigo,
          stockSistema: s.cantidad,
          stockContado: null,
          diferencia: null
        }));

        const nuevo: InventarioFisico = {
          id: this.siguienteId++,
          fechaInicio: new Date().toISOString(),
          fechaCierre: null,
          estado: 'EN_PROCESO',
          responsable: this.authService.obtenerSesion()()?.nombreCompleto ?? 'Usuario',
          items
        };

        this.inventarios.update((lista) => [...lista, nuevo]);
        return nuevo;
      })
    );
  }

  // Registra el conteo fisico de un item especifico dentro de un inventario EN_PROCESO.
  registrarConteo(inventarioId: number, materialId: number, ubicacionId: number, cantidadContada: number): Observable<InventarioFisico> {
    const inventario = this.inventarios().find((i) => i.id === inventarioId);
    if (!inventario) return throwError(() => new Error('Inventario no encontrado')).pipe(delay(300));
    if (inventario.estado === 'CERRADO') {
      return throwError(() => new Error('Este inventario ya está cerrado y no se puede modificar.')).pipe(delay(300));
    }

    const itemsActualizados = inventario.items.map((item) => {
      if (item.materialId === materialId && item.ubicacionId === ubicacionId) {
        return {
          ...item,
          stockContado: cantidadContada,
          diferencia: cantidadContada - item.stockSistema
        };
      }
      return item;
    });

    const actualizado: InventarioFisico = { ...inventario, items: itemsActualizados };
    this.inventarios.update((lista) => lista.map((i) => (i.id === inventarioId ? actualizado : i)));
    return of(actualizado).pipe(delay(300));
  }

  // Cierra el inventario: en Sprint 3, esto tambien dispara el ajuste real
  // del stock en el backend (movimientos de ajuste positivo/negativo).
  cerrar(inventarioId: number): Observable<InventarioFisico> {
    const inventario = this.inventarios().find((i) => i.id === inventarioId);
    if (!inventario) return throwError(() => new Error('Inventario no encontrado')).pipe(delay(300));

    const faltantesPorContar = inventario.items.some((item) => item.stockContado === null);
    if (faltantesPorContar) {
      return throwError(() => new Error('Hay materiales sin conteo registrado. Completa el conteo antes de cerrar.')).pipe(delay(300));
    }

    const cerrado: InventarioFisico = {
      ...inventario,
      estado: 'CERRADO',
      fechaCierre: new Date().toISOString()
    };
    this.inventarios.update((lista) => lista.map((i) => (i.id === inventarioId ? cerrado : i)));
    return of(cerrado).pipe(delay(500));
  }
}