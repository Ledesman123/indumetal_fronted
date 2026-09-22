import { Injectable, signal } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Material, MaterialRequest } from '../models/material.model';

/**
 * TEMPORAL (Sprint 2): guarda los materiales en memoria (un array), simulando
 * lo que en Sprint 3 sera una llamada real con HttpClient a /api/materiales.
 * Los metodos publicos (listar, crear, actualizar, eliminar, buscar) mantienen
 * la misma firma que tendran cuando se conecten al backend real.
 */
@Injectable({ providedIn: 'root' })
export class MaterialService {
  private materiales = signal<Material[]>([
    {
      id: 1,
      sku: 'MP-0001',
      nombre: 'Plancha de acero A36 4mm',
      descripcion: 'Plancha de acero estructural para fabricacion de piezas',
      unidadMedida: 'KG',
      categoria: 'MATERIA_PRIMA',
      stockMinimo: 200,
      stockMaximo: 2000,
      costoUnitario: 4.8,
      requiereLote: true,
      imagenUrl: null,
      activo: true
    },
    {
      id: 2,
      sku: 'INS-0012',
      nombre: 'Electrodo E6011 1/8"',
      descripcion: 'Electrodo para soldadura de uso general',
      unidadMedida: 'CAJA',
      categoria: 'INSUMO',
      stockMinimo: 20,
      stockMaximo: 150,
      costoUnitario: 32.5,
      requiereLote: false,
      imagenUrl: null,
      activo: true
    },
    {
      id: 3,
      sku: 'HTA-0005',
      nombre: 'Disco de corte 7"',
      descripcion: 'Disco abrasivo para amoladora',
      unidadMedida: 'UND',
      categoria: 'HERRAMIENTA',
      stockMinimo: 10,
      stockMaximo: 80,
      costoUnitario: 6.2,
      requiereLote: false,
      imagenUrl: null,
      activo: true
    }
  ]);

  private siguienteId = 4;

  listar(): Observable<Material[]> {
    return of(this.materiales()).pipe(delay(400));
  }

  buscar(termino: string, categoria: string | null): Observable<Material[]> {
    return this.listar().pipe(
      map((materiales) =>
        materiales.filter((m) => {
          const coincideTermino =
            !termino ||
            m.nombre.toLowerCase().includes(termino.toLowerCase()) ||
            m.sku.toLowerCase().includes(termino.toLowerCase());
          const coincideCategoria = !categoria || m.categoria === categoria;
          return coincideTermino && coincideCategoria;
        })
      )
    );
  }

  obtenerPorId(id: number): Observable<Material> {
    const encontrado = this.materiales().find((m) => m.id === id);
    if (!encontrado) {
      return throwError(() => new Error('Material no encontrado'));
    }
    return of(encontrado).pipe(delay(300));
  }

  crear(request: MaterialRequest): Observable<Material> {
    const existeSku = this.materiales().some((m) => m.sku.toLowerCase() === request.sku.toLowerCase());
    if (existeSku) {
      return throwError(() => new Error('Ya existe un material con ese SKU.')).pipe(delay(400));
    }

    const nuevo: Material = { id: this.siguienteId++, activo: true, ...request };
    this.materiales.update((lista) => [...lista, nuevo]);
    return of(nuevo).pipe(delay(500));
  }

  actualizar(id: number, request: MaterialRequest): Observable<Material> {
    const actual = this.materiales().find((m) => m.id === id);
    if (!actual) {
      return throwError(() => new Error('Material no encontrado')).pipe(delay(400));
    }

    const actualizado: Material = { ...actual, ...request };
    this.materiales.update((lista) => lista.map((m) => (m.id === id ? actualizado : m)));
    return of(actualizado).pipe(delay(500));
  }

  desactivar(id: number): Observable<void> {
    this.materiales.update((lista) =>
      lista.map((m) => (m.id === id ? { ...m, activo: false } : m))
    );
    return of(void 0).pipe(delay(400));
  }
  /** TEMPORAL (Sprint 2): snapshot sincrono, usado internamente por MovimientoService. */
  obtenerPorIdSync(id: number): Material | undefined {
    return this.materiales().find((m) => m.id === id);
  }
}