import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Material } from '../../core/models/material.model';
import { MaterialService } from '../../core/services/material.service';
import { MovimientoService } from '../../core/services/movimiento.service';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './reportes.html',
  styleUrl: './reportes.scss'
})
export class Reportes {
  private fb = inject(FormBuilder);
  private materialService = inject(MaterialService);
  private movimientoService = inject(MovimientoService);
  private snackBar = inject(MatSnackBar);

  materiales = signal<Material[]>([]);
  generando = signal<string | null>(null); // guarda que reporte se esta generando, para el spinner del boton correspondiente

  formMovimientos = this.fb.group({
    desde: [null as Date | null, Validators.required],
    hasta: [null as Date | null, Validators.required],
    materialId: [null as number | null]
  });

  formKardex = this.fb.group({
    materialId: [null as number | null, Validators.required]
  });

  constructor() {
    this.materialService.listar().subscribe((lista) => this.materiales.set(lista.filter((m) => m.activo)));
  }

  descargarMovimientos(formato: 'pdf' | 'excel'): void {
    if (this.formMovimientos.invalid) return;
    const clave = `movimientos-${formato}`;
    this.generando.set(clave);

    this.movimientoService.listarMovimientos().subscribe((movimientos) => {
      const { desde, hasta, materialId } = this.formMovimientos.value;
      const filtrados = movimientos.filter((m) => {
        const fecha = new Date(m.creadoEn);
        const cumpleFecha = fecha >= desde! && fecha <= hasta!;
        const cumpleMaterial = !materialId || m.materialId === materialId;
        return cumpleFecha && cumpleMaterial;
      });

      this.descargarComoCsv(
        `movimientos_${this.formatoFecha(desde!)}_${this.formatoFecha(hasta!)}.csv`,
        ['Fecha', 'Tipo', 'SKU', 'Material', 'Ubicación', 'Cantidad', 'Saldo', 'Usuario'],
        filtrados.map((m) => [
          new Date(m.creadoEn).toLocaleString('es-PE'),
          m.tipo,
          m.materialSku,
          m.materialNombre,
          m.ubicacionCodigo,
          m.cantidad,
          m.saldoResultante,
          m.usuario
        ])
      );

      this.generando.set(null);
      this.avisarDescarga(formato);
    });
  }

  descargarKardex(formato: 'pdf' | 'excel'): void {
    if (this.formKardex.invalid) return;
    const clave = `kardex-${formato}`;
    this.generando.set(clave);

    const materialId = this.formKardex.value.materialId!;
    const material = this.materiales().find((m) => m.id === materialId);

    this.movimientoService.listarKardex(materialId).subscribe((items) => {
      this.descargarComoCsv(
        `kardex_${material?.sku ?? materialId}.csv`,
        ['Fecha', 'Tipo', 'Ubicación', 'Entrada', 'Salida', 'Saldo', 'Referencia', 'Usuario'],
        items.map((i) => [
          new Date(i.fecha).toLocaleString('es-PE'),
          i.tipo,
          i.ubicacion,
          i.entrada || '',
          i.salida || '',
          i.saldo,
          i.referencia ?? '',
          i.usuario
        ])
      );

      this.generando.set(null);
      this.avisarDescarga(formato);
    });
  }

  descargarStock(): void {
    this.generando.set('stock-excel');

    this.movimientoService.listarStock().subscribe((stock) => {
      this.descargarComoCsv(
        `stock_actual_${this.formatoFecha(new Date())}.csv`,
        ['SKU', 'Material', 'Almacén', 'Ubicación', 'Cantidad', 'Unidad', 'Stock mínimo', 'Stock máximo'],
        stock.map((s) => [
          s.materialSku,
          s.materialNombre,
          s.almacenNombre,
          s.ubicacionCodigo,
          s.cantidad,
          s.unidadMedida,
          s.stockMinimo,
          s.stockMaximo
        ])
      );

      this.generando.set(null);
      this.avisarDescarga('excel');
    });
  }

  private avisarDescarga(formato: 'pdf' | 'excel'): void {
    const mensaje = formato === 'pdf'
      ? 'Reporte generado (simulado como CSV en Sprint 2; en Sprint 3 será un PDF real del backend).'
      : 'Reporte descargado correctamente.';
    this.snackBar.open(mensaje, 'Cerrar', { duration: 4000 });
  }

  private descargarComoCsv(nombreArchivo: string, encabezados: string[], filas: (string | number)[][]): void {
    const contenido = [encabezados, ...filas]
      .map((fila) => fila.map((valor) => `"${String(valor).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob(['\uFEFF' + contenido], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = nombreArchivo;
    enlace.click();
    URL.revokeObjectURL(url);
  }

  private formatoFecha(fecha: Date): string {
    return fecha.toISOString().slice(0, 10);
  }
}