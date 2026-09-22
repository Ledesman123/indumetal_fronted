import { Injectable, signal } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Almacen, AlmacenRequest } from '../models/almacen.model';

/**
 * TEMPORAL (Sprint 2): datos en memoria, misma firma que tendra el
 * HttpClient real en Sprint 3 contra /api/almacenes.
 */
@Injectable({ providedIn: 'root' })
export class AlmacenService {
  private almacenes = signal<Almacen[]>([
    { id: 1, codigo: 'ALM-01', nombre: 'Almacén Central', direccion: 'Planta principal - Av. Industrial 450', activo: true },
    { id: 2, codigo: 'ALM-02', nombre: 'Almacén de Herramientas', direccion: 'Nave B - Zona de mantenimiento', activo: true }
  ]);

  private siguienteId = 3;

  listar(): Observable<Almacen[]> {
    return of(this.almacenes()).pipe(delay(400));
  }

  crear(request: AlmacenRequest): Observable<Almacen> {
    const existeCodigo = this.almacenes().some((a) => a.codigo.toLowerCase() === request.codigo.toLowerCase());
    if (existeCodigo) {
      return throwError(() => new Error('Ya existe un almacén con ese código.')).pipe(delay(400));
    }

    const nuevo: Almacen = { id: this.siguienteId++, activo: true, ...request };
    this.almacenes.update((lista) => [...lista, nuevo]);
    return of(nuevo).pipe(delay(500));
  }

  actualizar(id: number, request: AlmacenRequest): Observable<Almacen> {
    const actual = this.almacenes().find((a) => a.id === id);
    if (!actual) {
      return throwError(() => new Error('Almacén no encontrado')).pipe(delay(400));
    }
    const actualizado: Almacen = { ...actual, ...request };
    this.almacenes.update((lista) => lista.map((a) => (a.id === id ? actualizado : a)));
    return of(actualizado).pipe(delay(500));
  }

  desactivar(id: number): Observable<void> {
    this.almacenes.update((lista) => lista.map((a) => (a.id === id ? { ...a, activo: false } : a)));
    return of(void 0).pipe(delay(400));
  }
}