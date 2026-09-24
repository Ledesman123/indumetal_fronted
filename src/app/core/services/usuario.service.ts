import { Injectable, signal } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Usuario, UsuarioRequest } from '../models/usuario.model';

/**
 * TEMPORAL (Sprint 2): datos en memoria, misma firma que tendra el
 * HttpClient real en Sprint 3 contra /api/usuarios.
 */
@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private usuarios = signal<Usuario[]>([
    { id: 1, nombres: 'Administrador', apellidos: 'General', correo: 'admin@indumetal.pe', rol: 'ADMINISTRADOR', activo: true },
    { id: 2, nombres: 'Carlos', apellidos: 'Ramírez', correo: 'carlos.ramirez@indumetal.pe', rol: 'SUPERVISOR_ALMACEN', activo: true },
    { id: 3, nombres: 'Lucía', apellidos: 'Torres', correo: 'lucia.torres@indumetal.pe', rol: 'ALMACENERO', activo: true }
  ]);

  private siguienteId = 4;

  listar(): Observable<Usuario[]> {
    return of(this.usuarios()).pipe(delay(400));
  }

  crear(request: UsuarioRequest): Observable<Usuario> {
    const existeCorreo = this.usuarios().some((u) => u.correo.toLowerCase() === request.correo.toLowerCase());
    if (existeCorreo) {
      return throwError(() => new Error('Ya existe un usuario con ese correo.')).pipe(delay(400));
    }

    const nuevo: Usuario = {
      id: this.siguienteId++,
      activo: true,
      nombres: request.nombres,
      apellidos: request.apellidos,
      correo: request.correo,
      rol: request.rol
    };
    this.usuarios.update((lista) => [...lista, nuevo]);
    return of(nuevo).pipe(delay(500));
  }

  actualizar(id: number, request: UsuarioRequest): Observable<Usuario> {
    const actual = this.usuarios().find((u) => u.id === id);
    if (!actual) return throwError(() => new Error('Usuario no encontrado')).pipe(delay(400));

    const actualizado: Usuario = {
      ...actual,
      nombres: request.nombres,
      apellidos: request.apellidos,
      correo: request.correo,
      rol: request.rol
    };
    this.usuarios.update((lista) => lista.map((u) => (u.id === id ? actualizado : u)));
    return of(actualizado).pipe(delay(500));
  }

  cambiarEstado(id: number, activo: boolean): Observable<void> {
    this.usuarios.update((lista) => lista.map((u) => (u.id === id ? { ...u, activo } : u)));
    return of(void 0).pipe(delay(400));
  }
}