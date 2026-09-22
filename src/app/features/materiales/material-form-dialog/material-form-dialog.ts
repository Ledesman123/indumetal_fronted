import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Material, CATEGORIAS_MATERIAL, UNIDADES_MEDIDA } from '../../../core/models/material.model';
import { MaterialService } from '../../../core/services/material.service';

export interface MaterialFormDialogData {
  material?: Material;
}

@Component({
  selector: 'app-material-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './material-form-dialog.html',
  styleUrl: './material-form-dialog.scss'
})
export class MaterialFormDialog {
  private fb = inject(FormBuilder);
  private materialService = inject(MaterialService);
  private dialogRef = inject(MatDialogRef<MaterialFormDialog>);
  private data = inject<MaterialFormDialogData>(MAT_DIALOG_DATA, { optional: true });

  categorias = CATEGORIAS_MATERIAL;
  unidades = UNIDADES_MEDIDA;

  esEdicion = !!this.data?.material;
  cargando = signal(false);
  error = signal<string | null>(null);
  arrastrandoImagen = signal(false);
  imagenPreview = signal<string | null>(this.data?.material?.imagenUrl ?? null);

  form = this.fb.group({
    sku: [this.data?.material?.sku ?? '', [Validators.required, Validators.maxLength(20)]],
    nombre: [this.data?.material?.nombre ?? '', [Validators.required, Validators.maxLength(150)]],
    descripcion: [this.data?.material?.descripcion ?? '', [Validators.maxLength(300)]],
    unidadMedida: [this.data?.material?.unidadMedida ?? 'UND', [Validators.required]],
    categoria: [this.data?.material?.categoria ?? 'MATERIA_PRIMA', [Validators.required]],
    stockMinimo: [this.data?.material?.stockMinimo ?? 0, [Validators.required, Validators.min(0)]],
    stockMaximo: [this.data?.material?.stockMaximo ?? 0, [Validators.required, Validators.min(0)]],
    costoUnitario: [this.data?.material?.costoUnitario ?? 0, [Validators.required, Validators.min(0)]],
    requiereLote: [this.data?.material?.requiereLote ?? false]
  });

  // ---------- Drag & drop de imagen (RF-19) ----------

  onDragOver(evento: DragEvent): void {
    evento.preventDefault();
    this.arrastrandoImagen.set(true);
  }

  onDragLeave(evento: DragEvent): void {
    evento.preventDefault();
    this.arrastrandoImagen.set(false);
  }

  onDrop(evento: DragEvent): void {
    evento.preventDefault();
    this.arrastrandoImagen.set(false);
    const archivo = evento.dataTransfer?.files?.[0];
    if (archivo) this.procesarImagen(archivo);
  }

  onSeleccionarArchivo(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0];
    if (archivo) this.procesarImagen(archivo);
  }

  quitarImagen(): void {
    this.imagenPreview.set(null);
  }

  private procesarImagen(archivo: File): void {
    if (!archivo.type.startsWith('image/')) {
      this.error.set('Solo se permiten archivos de imagen (JPG, PNG, WEBP).');
      return;
    }
    if (archivo.size > 3 * 1024 * 1024) {
      this.error.set('La imagen no debe superar los 3 MB.');
      return;
    }

    this.error.set(null);
    const lector = new FileReader();
    // TEMPORAL (Sprint 2): se guarda como base64 en memoria para previsualizar.
    // En Sprint 3 esto se reemplaza por una subida real al backend, que
    // devolvera una URL definitiva para guardar en imagenUrl.
    lector.onload = () => this.imagenPreview.set(lector.result as string);
    lector.readAsDataURL(archivo);
  }

  // ---------- Guardar ----------

  guardar(): void {
    if (this.form.invalid) return;

    if (this.form.value.stockMaximo! < this.form.value.stockMinimo!) {
      this.error.set('El stock máximo no puede ser menor que el stock mínimo.');
      return;
    }

    this.error.set(null);
    this.cargando.set(true);

    const request = {
      sku: this.form.value.sku!,
      nombre: this.form.value.nombre!,
      descripcion: this.form.value.descripcion ?? '',
      unidadMedida: this.form.value.unidadMedida!,
      categoria: this.form.value.categoria!,
      stockMinimo: this.form.value.stockMinimo!,
      stockMaximo: this.form.value.stockMaximo!,
      costoUnitario: this.form.value.costoUnitario!,
      requiereLote: this.form.value.requiereLote!,
      imagenUrl: this.imagenPreview()
    };

    const operacion = this.esEdicion
      ? this.materialService.actualizar(this.data!.material!.id, request)
      : this.materialService.crear(request);

    operacion.subscribe({
      next: (resultado) => {
        this.cargando.set(false);
        this.dialogRef.close(resultado);
      },
      error: (err) => {
        this.cargando.set(false);
        this.error.set(err.message ?? 'No se pudo guardar el material.');
      }
    });
  }

  cerrar(): void {
    this.dialogRef.close(null);
  }
}