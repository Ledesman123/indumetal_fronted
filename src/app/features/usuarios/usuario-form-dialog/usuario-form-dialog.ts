import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Usuario, ROLES_DISPONIBLES } from '../../../core/models/usuario.model';
import { UsuarioService } from '../../../core/services/usuario.service';

export interface UsuarioFormDialogData {
  usuario?: Usuario;
}

@Component({
  selector: 'app-usuario-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './usuario-form-dialog.html',
  styleUrl: './usuario-form-dialog.scss'
})
export class UsuarioFormDialog {
  private fb = inject(FormBuilder);
  private usuarioService = inject(UsuarioService);
  private dialogRef = inject(MatDialogRef<UsuarioFormDialog>);
  private data = inject<UsuarioFormDialogData>(MAT_DIALOG_DATA, { optional: true });

  roles = ROLES_DISPONIBLES;
  esEdicion = !!this.data?.usuario;
  cargando = signal(false);
  error = signal<string | null>(null);

  form = this.fb.group({
    nombres: [this.data?.usuario?.nombres ?? '', [Validators.required, Validators.maxLength(60)]],
    apellidos: [this.data?.usuario?.apellidos ?? '', [Validators.required, Validators.maxLength(60)]],
    correo: [this.data?.usuario?.correo ?? '', [Validators.required, Validators.email]],
    rol: [this.data?.usuario?.rol ?? 'ALMACENERO', [Validators.required]],
    password: ['', this.esEdicion ? [] : [Validators.required, Validators.minLength(8)]]
  });

  guardar(): void {
    if (this.form.invalid) return;

    this.error.set(null);
    this.cargando.set(true);

    const request = {
      nombres: this.form.value.nombres!,
      apellidos: this.form.value.apellidos!,
      correo: this.form.value.correo!,
      rol: this.form.value.rol! as Usuario['rol'],
      password: this.form.value.password || undefined
    };

    const operacion = this.esEdicion
      ? this.usuarioService.actualizar(this.data!.usuario!.id, request)
      : this.usuarioService.crear(request);

    operacion.subscribe({
      next: (resultado) => {
        this.cargando.set(false);
        this.dialogRef.close(resultado);
      },
      error: (err) => {
        this.cargando.set(false);
        this.error.set(err.message ?? 'No se pudo guardar el usuario.');
      }
    });
  }

  cerrar(): void {
    this.dialogRef.close(null);
  }
}