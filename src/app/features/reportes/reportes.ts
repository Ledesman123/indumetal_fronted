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
import { ReporteService, FormatoReporte } from '../../core/services/reporte.service';
import { Observable } from 'rxjs';

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
  private reporteService = inject(ReporteService);
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

  descargarMovimientos(formato: FormatoReporte): void {
    if (this.formMovimientos.invalid) return;
    const { desde, hasta, materialId } = this.formMovimientos.value;
    if (hasta! < desde!) {
      this.snackBar.open('La fecha "hasta" no puede ser anterior a "desde".', 'Cerrar', { duration: 4000 });
      return;
    }
    this.ejecutar(`movimientos-${formato}`, this.reporteService.movimientos(formato, desde!, hasta!, materialId ?? null));
  }

  descargarKardex(formato: FormatoReporte): void {
    if (this.formKardex.invalid) return;
    const materialId = this.formKardex.value.materialId!;
    const sku = this.materiales().find((m) => m.id === materialId)?.sku ?? String(materialId);
    this.ejecutar(`kardex-${formato}`, this.reporteService.kardex(formato, materialId, sku));
  }

  descargarStock(): void {
    this.ejecutar('stock-excel', this.reporteService.stock());
  }

  private ejecutar(clave: string, descarga: Observable<void>): void {
    this.generando.set(clave);
    descarga.subscribe({
      next: () => {
        this.generando.set(null);
        this.snackBar.open('Reporte descargado correctamente.', 'Cerrar', { duration: 3000 });
      },
      error: (err) => {
        this.generando.set(null);
        this.snackBar.open(err.message ?? 'No se pudo generar el reporte.', 'Cerrar', { duration: 5000 });
      }
    });
  }
}