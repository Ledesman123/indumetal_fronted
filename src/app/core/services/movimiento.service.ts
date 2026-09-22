import { Injectable, inject, signal } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import {
  DevolucionRequest,
  IngresoRequest,
  MovimientoAlmacen,
  SalidaRequest,
  TipoMovimiento,
  TransferenciaRequest
} from '../models/movimiento.model';
import { StockUbicacion } from '../models/stock.model';
import { KardexItem } from '../models/kardex.model';
import { MaterialService } from './material.service';
import { UbicacionService } from './ubicacion.service';
import { AlmacenService } from './almacen.service';
import { AuthService } from './auth.service';

interface StockInterno {
  materialId: number;
  ubicacionId: number;
  cantidad: number;
}

/**
 * TEMPORAL (Sprint 2): simula RF-06/07/08/09/10/17/18 en memoria.
 * En Sprint 3 esto se reemplaza por HttpClient contra /api/movimientos/*,
 * /api/materiales/{id}/stock y /api/materiales/{id}/kardex.
 */
@Injectable({ providedIn: 'root' })
export class MovimientoService {
  private materialService = inject(MaterialService);
  private ubicacionService = inject(UbicacionService);
  private almacenService = inject(AlmacenService);
  private authService = inject(AuthService);

  private movimientos = signal<MovimientoAlmacen[]>([]);
  private stock = signal<StockInterno[]>([
    { materialId: 1, ubicacionId: 1, cantidad: 850 },
    { materialId: 2, ubicacionId: 2, cantidad: 15 }, // por debajo del stock minimo (20), a proposito, para probar la alerta
    { materialId: 3, ubicacionId: 3, cantidad: 60 }
  ]);

  private siguienteId = 1;

  // ---------- RF-06 / RF-07: Ingreso con asignacion automatica de ubicacion ----------

  registrarIngreso(request: IngresoRequest): Observable<MovimientoAlmacen> {
    const material = this.materialService.obtenerPorIdSync(request.materialId);
    if (!material) return throwError(() => new Error('Material no encontrado')).pipe(delay(400));

    let ubicacionId = request.ubicacionId;
    if (!ubicacionId) {
      // RF-07: reutiliza una ubicacion donde el material ya tenga stock, o la primera ubicacion activa.
      const stockExistente = this.stock().find((s) => s.materialId === request.materialId);
      ubicacionId = stockExistente?.ubicacionId ?? this.ubicacionService.primeraActivaSync()?.id ?? null;
      if (!ubicacionId) {
        return throwError(() => new Error('No hay ubicaciones activas para la asignación automática.')).pipe(delay(400));
      }
    }

    const ubicacion = this.ubicacionService.obtenerPorIdSync(ubicacionId);
    if (!ubicacion) return throwError(() => new Error('Ubicación no encontrada')).pipe(delay(400));

    const nuevoSaldo = this.sumarStock(request.materialId, ubicacionId, request.cantidad);

    const movimiento = this.crearRegistroMovimiento({
      tipo: 'INGRESO',
      material,
      ubicacion,
      cantidad: request.cantidad,
      saldoResultante: nuevoSaldo,
      lote: request.lote,
      fechaVencimiento: request.fechaVencimiento,
      ordenCompra: request.ordenCompra,
      proveedor: request.proveedor
    });

    return of(movimiento).pipe(delay(500));
  }

  // ---------- RF-08: Salida ----------

  registrarSalida(request: SalidaRequest): Observable<MovimientoAlmacen> {
    const material = this.materialService.obtenerPorIdSync(request.materialId);
    const ubicacion = this.ubicacionService.obtenerPorIdSync(request.ubicacionId);
    if (!material || !ubicacion) {
      return throwError(() => new Error('Material o ubicación no encontrados')).pipe(delay(400));
    }

    const stockActual = this.obtenerStockSync(request.materialId, request.ubicacionId);
    if (request.cantidad > stockActual) {
      return throwError(() => new Error(
        `Stock insuficiente: hay ${stockActual} ${material.unidadMedida} disponibles en ${ubicacion.codigo}.`
      )).pipe(delay(400));
    }

    const nuevoSaldo = this.restarStock(request.materialId, request.ubicacionId, request.cantidad);

    const movimiento = this.crearRegistroMovimiento({
      tipo: 'SALIDA',
      material,
      ubicacion,
      cantidad: request.cantidad,
      saldoResultante: nuevoSaldo,
      ordenProduccion: request.ordenProduccion,
      areaSolicitante: request.areaSolicitante
    });

    return of(movimiento).pipe(delay(500));
  }

  // ---------- RF-17: Devolucion ----------

  registrarDevolucion(request: DevolucionRequest): Observable<MovimientoAlmacen> {
    const material = this.materialService.obtenerPorIdSync(request.materialId);
    const ubicacion = this.ubicacionService.obtenerPorIdSync(request.ubicacionId);
    if (!material || !ubicacion) {
      return throwError(() => new Error('Material o ubicación no encontrados')).pipe(delay(400));
    }

    const nuevoSaldo = this.sumarStock(request.materialId, request.ubicacionId, request.cantidad);

    const movimiento = this.crearRegistroMovimiento({
      tipo: 'DEVOLUCION',
      material,
      ubicacion,
      cantidad: request.cantidad,
      saldoResultante: nuevoSaldo,
      ordenProduccion: request.ordenProduccion,
      areaSolicitante: request.motivo
    });

    return of(movimiento).pipe(delay(500));
  }

  // ---------- RF-18: Transferencia entre ubicaciones ----------

  registrarTransferencia(request: TransferenciaRequest): Observable<MovimientoAlmacen> {
    const material = this.materialService.obtenerPorIdSync(request.materialId);
    const origen = this.ubicacionService.obtenerPorIdSync(request.ubicacionOrigenId);
    const destino = this.ubicacionService.obtenerPorIdSync(request.ubicacionDestinoId);
    if (!material || !origen || !destino) {
      return throwError(() => new Error('Material o ubicaciones no encontrados')).pipe(delay(400));
    }
    if (origen.id === destino.id) {
      return throwError(() => new Error('La ubicación de origen y destino no pueden ser la misma.')).pipe(delay(400));
    }

    const stockActual = this.obtenerStockSync(request.materialId, request.ubicacionOrigenId);
    if (request.cantidad > stockActual) {
      return throwError(() => new Error(
        `Stock insuficiente en ${origen.codigo}: solo hay ${stockActual} ${material.unidadMedida}.`
      )).pipe(delay(400));
    }

    this.restarStock(request.materialId, request.ubicacionOrigenId, request.cantidad);
    const nuevoSaldoDestino = this.sumarStock(request.materialId, request.ubicacionDestinoId, request.cantidad);

    const movimiento = this.crearRegistroMovimiento({
      tipo: 'TRANSFERENCIA',
      material,
      ubicacion: origen,
      ubicacionDestino: destino,
      cantidad: request.cantidad,
      saldoResultante: nuevoSaldoDestino
    });

    return of(movimiento).pipe(delay(500));
  }

  // ---------- RF-10: Stock en tiempo real ----------

  listarStock(): Observable<StockUbicacion[]> {
    const filas: StockUbicacion[] = this.stock()
      .filter((s) => s.cantidad > 0)
      .map((s) => {
        const material = this.materialService.obtenerPorIdSync(s.materialId)!;
        const ubicacion = this.ubicacionService.obtenerPorIdSync(s.ubicacionId)!;
        const almacen = this.almacenService.obtenerPorIdSync(ubicacion.almacenId);
        return {
          materialId: s.materialId,
          materialSku: material.sku,
          materialNombre: material.nombre,
          unidadMedida: material.unidadMedida,
          ubicacionId: s.ubicacionId,
          ubicacionCodigo: ubicacion.codigo,
          almacenNombre: almacen?.nombre ?? '—',
          cantidad: s.cantidad,
          stockMinimo: material.stockMinimo,
          stockMaximo: material.stockMaximo
        };
      });
    return of(filas).pipe(delay(400));
  }

  // ---------- RF-09: Kardex de un material ----------

  listarKardex(materialId: number): Observable<KardexItem[]> {
    const items: KardexItem[] = this.movimientos()
      .filter((m) => m.materialId === materialId)
      .sort((a, b) => a.creadoEn.localeCompare(b.creadoEn))
      .map((m) => ({
        fecha: m.creadoEn,
        tipo: m.tipo,
        ubicacion: m.tipo === 'TRANSFERENCIA'
          ? `${m.ubicacionCodigo} → ${m.ubicacionDestinoCodigo}`
          : m.ubicacionCodigo,
        entrada: m.tipo === 'INGRESO' || m.tipo === 'DEVOLUCION' ? m.cantidad : 0,
        salida: m.tipo === 'SALIDA' || m.tipo === 'TRANSFERENCIA' ? m.cantidad : 0,
        saldo: m.saldoResultante,
        referencia: m.ordenCompra ?? m.ordenProduccion ?? undefined,
        usuario: m.usuario
      }));
    return of(items).pipe(delay(400));
  }

  listarMovimientos(): Observable<MovimientoAlmacen[]> {
    const lista = [...this.movimientos()].sort((a, b) => b.creadoEn.localeCompare(a.creadoEn));
    return of(lista).pipe(delay(400));
  }

  // ---------- helpers internos ----------

  private crearRegistroMovimiento(params: {
    tipo: TipoMovimiento;
    material: { id: number; sku: string; nombre: string };
    ubicacion: { id: number; codigo: string };
    ubicacionDestino?: { id: number; codigo: string };
    cantidad: number;
    saldoResultante: number;
    lote?: string;
    fechaVencimiento?: string;
    ordenCompra?: string;
    proveedor?: string;
    ordenProduccion?: string;
    areaSolicitante?: string;
  }): MovimientoAlmacen {
    const movimiento: MovimientoAlmacen = {
      id: this.siguienteId++,
      tipo: params.tipo,
      materialId: params.material.id,
      materialSku: params.material.sku,
      materialNombre: params.material.nombre,
      ubicacionId: params.ubicacion.id,
      ubicacionCodigo: params.ubicacion.codigo,
      ubicacionDestinoId: params.ubicacionDestino?.id,
      ubicacionDestinoCodigo: params.ubicacionDestino?.codigo,
      cantidad: params.cantidad,
      saldoResultante: params.saldoResultante,
      lote: params.lote,
      fechaVencimiento: params.fechaVencimiento,
      ordenCompra: params.ordenCompra,
      proveedor: params.proveedor,
      ordenProduccion: params.ordenProduccion,
      areaSolicitante: params.areaSolicitante,
      usuario: this.authService.obtenerSesion()()?.nombreCompleto ?? 'Usuario',
      creadoEn: new Date().toISOString()
    };
    this.movimientos.update((lista) => [...lista, movimiento]);
    return movimiento;
  }

  private sumarStock(materialId: number, ubicacionId: number, cantidad: number): number {
    let nuevoSaldo = cantidad;
    this.stock.update((lista) => {
      const existente = lista.find((s) => s.materialId === materialId && s.ubicacionId === ubicacionId);
      if (existente) {
        const listaActualizada = lista.map((s) =>
          s === existente ? { ...s, cantidad: s.cantidad + cantidad } : s
        );
        nuevoSaldo = existente.cantidad + cantidad;
        return listaActualizada;
      }
      return [...lista, { materialId, ubicacionId, cantidad }];
    });
    return nuevoSaldo;
  }

  private restarStock(materialId: number, ubicacionId: number, cantidad: number): number {
    let nuevoSaldo = 0;
    this.stock.update((lista) =>
      lista.map((s) => {
        if (s.materialId === materialId && s.ubicacionId === ubicacionId) {
          nuevoSaldo = s.cantidad - cantidad;
          return { ...s, cantidad: nuevoSaldo };
        }
        return s;
      })
    );
    return nuevoSaldo;
  }

  private obtenerStockSync(materialId: number, ubicacionId: number): number {
    return this.stock().find((s) => s.materialId === materialId && s.ubicacionId === ubicacionId)?.cantidad ?? 0;
  }
}