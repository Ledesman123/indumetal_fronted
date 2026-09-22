import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Almacen } from '../../../core/models/almacen.model';
import { AlmacenService } from '../../../core/services/almacen.service';

export interface AlmacenFormDialogData {
  almacen?: Almacen;
}

@Component({
  selector: 'app-almacen-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './almacen-form-dialog.html',
  styleUrl: './almacen-form-dialog.scss'
})
export class AlmacenFormDialog {
  private fb = inject(FormBuilder);
  private almacenService = inject(AlmacenService);
  private dialogRef = inject(MatDialogRef<AlmacenFormDialog>);
  private data = inject<AlmacenFormDialogData>(MAT_DIALOG_DATA, { optional: true });

  esEdicion = !!this.data?.almacen;
  cargando = signal(false);
  error = signal<string | null>(null);

  form = this.fb.group({
    codigo: [this.data?.almacen?.codigo ?? '', [Validators.required, Validators.maxLength(20)]],
    nombre: [this.data?.almacen?.nombre ?? '', [Validators.required, Validators.maxLength(100)]],
    direccion: [this.data?.almacen?.direccion ?? '', [Validators.maxLength(200)]]
  });

  guardar(): void {
    if (this.form.invalid) return;

    this.error.set(null);
    this.cargando.set(true);

    const request = {
      codigo: this.form.value.codigo!,
      nombre: this.form.value.nombre!,
      direccion: this.form.value.direccion ?? ''
    };

    const operacion = this.esEdicion
      ? this.almacenService.actualizar(this.data!.almacen!.id, request)
      : this.almacenService.crear(request);

    operacion.subscribe({
      next: (resultado) => {
        this.cargando.set(false);
        this.dialogRef.close(resultado);
      },
      error: (err) => {
        this.cargando.set(false);
        this.error.set(err.message ?? 'No se pudo guardar el almacén.');
      }
    });
  }

  cerrar(): void {
    this.dialogRef.close(null);
  }
}