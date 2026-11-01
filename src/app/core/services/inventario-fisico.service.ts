import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { InventarioFisico } from '../models/inventario-fisico.model';

/** Forma en que el backend devuelve un inventario (InventarioFisicoResponse). */
interface InventarioFisicoApi {
  id: number;
  almacenId: number;
  almacenNombre: string;
  estado: 'ABIERTO' | 'CERRADO';
  responsable: string;
  fechaInicio: string;
  fechaCierre: string | null;
  detalles: {
    id: number;
    materialId: number;
    materialSku: string;
    materialNombre: string;
    ubicacionId: number;
    ubicacionCodigo: string;
    stockSistema: number;
    stockFisico: number | null;
    diferencia: number | null;
  }[];
}

/** RF-12: inventario fisico contra /api/inventarios-fisicos. */
@Injectable({ providedIn: 'root' })
export class InventarioFisicoService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/inventarios-fisicos`;

  listar(): Observable<InventarioFisico[]> {
    return this.http
      .get<ApiResponse<InventarioFisicoApi[]>>(this.url)
      .pipe(map((r) => r.data.map(aInventario)));
  }

  obtenerPorId(id: number): Observable<InventarioFisico> {
    return this.http
      .get<ApiResponse<InventarioFisicoApi>>(`${this.url}/${id}`)
      .pipe(map((r) => aInventario(r.data)));
  }

  // Toma la "foto" del stock actual de TODOS los materiales del almacen indicado.
  iniciar(almacenId: number): Observable<InventarioFisico> {
    return this.http
      .post<ApiResponse<InventarioFisicoApi>>(this.url, { almacenId, materialIds: [] })
      .pipe(map((r) => aInventario(r.data)));
  }

  // Registra el conteo de un item y devuelve el inventario actualizado.
  registrarConteo(inventarioId: number, detalleId: number, cantidadContada: number): Observable<InventarioFisico> {
    return this.http
      .post<ApiResponse<unknown>>(`${this.url}/conteos`, { detalleId, stockFisico: cantidadContada })
      .pipe(switchMap(() => this.obtenerPorId(inventarioId)));
  }

  // Cierra el inventario: el backend ajusta el stock del sistema a lo contado.
  cerrar(inventarioId: number): Observable<InventarioFisico> {
    return this.http
      .post<ApiResponse<InventarioFisicoApi>>(`${this.url}/${inventarioId}/cerrar`, null)
      .pipe(map((r) => aInventario(r.data)));
  }
}

function aInventario(i: InventarioFisicoApi): InventarioFisico {
  return {
    id: i.id,
    almacenId: i.almacenId,
    almacenNombre: i.almacenNombre,
    fechaInicio: i.fechaInicio,
    fechaCierre: i.fechaCierre,
    estado: i.estado === 'ABIERTO' ? 'EN_PROCESO' : 'CERRADO',
    responsable: i.responsable,
    items: i.detalles.map((d) => ({
      detalleId: d.id,
      materialId: d.materialId,
      materialSku: d.materialSku,
      materialNombre: d.materialNombre,
      ubicacionId: d.ubicacionId,
      ubicacionCodigo: d.ubicacionCodigo,
      stockSistema: d.stockSistema,
      stockContado: d.stockFisico,
      diferencia: d.diferencia
    }))
  };
}
