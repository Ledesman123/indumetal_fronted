import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';

type Paso = 'correo' | 'codigo' | 'nueva-password' | 'exito';

@Component({
  selector: 'app-forgot-password-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './forgot-password-dialog.html',
  styleUrl: './forgot-password-dialog.scss'
})
export class ForgotPasswordDialog {
  // Los servicios inyectados van PRIMERO como campos, para que ya existan
  // cuando los campos de abajo (formCorreo, etc.) los usen en su inicializacion.
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private dialogRef = inject(MatDialogRef<ForgotPasswordDialog>);

  paso = signal<Paso>('correo');
  cargando = signal(false);
  error = signal<string | null>(null);

  private correoGuardado = '';
  private resetTokenGuardado = '';

  formCorreo = this.fb.group({
    correo: ['', [Validators.required, Validators.email]]
  });

  formCodigo = this.fb.group({
    codigo: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
  });

  formNuevaPassword = this.fb.group({
    nuevaPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmarPassword: ['', [Validators.required]]
  });

  enviarCodigo(): void {
    if (this.formCorreo.invalid) return;
    this.error.set(null);
    this.cargando.set(true);
    this.correoGuardado = this.formCorreo.value.correo!;

    this.authService.solicitarCodigo(this.correoGuardado).subscribe({
      next: () => {
        this.cargando.set(false);
        this.paso.set('codigo');
      },
      error: () => {
        this.cargando.set(false);
        this.error.set('No se pudo enviar el codigo. Intenta nuevamente.');
      }
    });
  }

  verificarCodigo(): void {
    if (this.formCodigo.invalid) return;
    this.error.set(null);
    this.cargando.set(true);

    this.authService.verificarCodigo(this.correoGuardado, this.formCodigo.value.codigo!).subscribe({
      next: (respuesta) => {
        this.cargando.set(false);
        this.resetTokenGuardado = respuesta.resetToken;
        this.paso.set('nueva-password');
      },
      error: (err) => {
        this.cargando.set(false);
        this.error.set(err.message ?? 'Codigo invalido.');
      }
    });
  }

  cambiarPassword(): void {
    if (this.formNuevaPassword.invalid) return;

    const { nuevaPassword, confirmarPassword } = this.formNuevaPassword.value;
    if (nuevaPassword !== confirmarPassword) {
      this.error.set('Las contrasenas no coinciden.');
      return;
    }

    this.error.set(null);
    this.cargando.set(true);

    this.authService.resetearPassword(this.correoGuardado, this.resetTokenGuardado, nuevaPassword!).subscribe({
      next: () => {
        this.cargando.set(false);
        this.paso.set('exito');
      },
      error: (err) => {
        this.cargando.set(false);
        this.error.set(err.message ?? 'No se pudo actualizar la contrasena.');
      }
    });
  }

  cerrar(): void {
    this.dialogRef.close();
  }
}