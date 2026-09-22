import { Injectable, signal } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Ubicacion, UbicacionRequest } from '../models/ubicacion.model';

@Injectable({ providedIn: 'root' })
export class UbicacionService {
    private ubicaciones = signal<Ubicacion[]>([
        { id: 1, codigo: 'A-01-01', almacenId: 1, activo: true },
        { id: 2, codigo: 'A-01-02', almacenId: 1, activo: true },
        { id: 3, codigo: 'A-02-01', almacenId: 1, activo: true },
        { id: 4, codigo: 'B-01-01', almacenId: 2, activo: true }
    ]);

    private siguienteId = 5;

    listarPorAlmacen(almacenId: number): Observable<Ubicacion[]> {
        return of(this.ubicaciones()).pipe(
            delay(350),
            map((lista) => lista.filter((u) => u.almacenId === almacenId))
        );
    }

    crear(request: UbicacionRequest): Observable<Ubicacion> {
        const existeCodigo = this.ubicaciones().some(
            (u) => u.almacenId === request.almacenId && u.codigo.toLowerCase() === request.codigo.toLowerCase()
        );
        if (existeCodigo) {
            return throwError(() => new Error('Ya existe una ubicación con ese código en este almacén.')).pipe(delay(400));
        }

        const nueva: Ubicacion = { id: this.siguienteId++, activo: true, ...request };
        this.ubicaciones.update((lista) => [...lista, nueva]);
        return of(nueva).pipe(delay(500));
    }

    actualizar(id: number, request: UbicacionRequest): Observable<Ubicacion> {
        const actual = this.ubicaciones().find((u) => u.id === id);
        if (!actual) {
            return throwError(() => new Error('Ubicación no encontrada')).pipe(delay(400));
        }
        const actualizada: Ubicacion = { ...actual, ...request };
        this.ubicaciones.update((lista) => lista.map((u) => (u.id === id ? actualizada : u)));
        return of(actualizada).pipe(delay(500));
    }

    desactivar(id: number): Observable<void> {
        this.ubicaciones.update((lista) => lista.map((u) => (u.id === id ? { ...u, activo: false } : u)));
        return of(void 0).pipe(delay(400));
    }
    /** TEMPORAL (Sprint 2): snapshot sincrono, usado internamente por MovimientoService. */
    obtenerPorIdSync(id: number): Ubicacion | undefined {
        return this.ubicaciones().find((u) => u.id === id);
    }

    primeraActivaSync(): Ubicacion | undefined {
        return this.ubicaciones()
            .filter((u) => u.activo)
            .sort((a, b) => a.id - b.id)[0];
    }
}