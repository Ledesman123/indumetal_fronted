import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Ubicacion } from '../../../core/models/ubicacion.model';
import { UbicacionService } from '../../../core/services/ubicacion.service';

export interface UbicacionFormDialogData {
  almacenId: number;
  ubicacion?: Ubicacion;
}

@Component({
  selector: 'app-ubicacion-form-dialog',
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
  templateUrl: './ubicacion-form-dialog.html',
  styleUrl: './ubicacion-form-dialog.scss'
})
export class UbicacionFormDialog {
  private fb = inject(FormBuilder);
  private ubicacionService = inject(UbicacionService);
  private dialogRef = inject(MatDialogRef<UbicacionFormDialog>);
  private data = inject<UbicacionFormDialogData>(MAT_DIALOG_DATA);

  esEdicion = !!this.data.ubicacion;
  cargando = signal(false);
  error = signal<string | null>(null);

  form = this.fb.group({
    codigo: [this.data.ubicacion?.codigo ?? '', [Validators.required, Validators.maxLength(20)]]
  });

  guardar(): void {
    if (this.form.invalid) return;

    this.error.set(null);
    this.cargando.set(true);

    const request = {
      codigo: this.form.value.codigo!,
      almacenId: this.data.almacenId
    };

    const operacion = this.esEdicion
      ? this.ubicacionService.actualizar(this.data.ubicacion!.id, request)
      : this.ubicacionService.crear(request);

    operacion.subscribe({
      next: (resultado) => {
        this.cargando.set(false);
        this.dialogRef.close(resultado);
      },
      error: (err) => {
        this.cargando.set(false);
        this.error.set(err.message ?? 'No se pudo guardar la ubicación.');
      }
    });
  }

  cerrar(): void {
    this.dialogRef.close(null);
  }
}