import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PerfilService } from '../../core/services/perfil.service';

@Component({
  selector: 'app-cambiar-password-dialog',
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
  templateUrl: './cambiar-password-dialog.html',
  styleUrl: './cambiar-password-dialog.scss'
})
export class CambiarPasswordDialog {
  private fb = inject(FormBuilder);
  private perfilService = inject(PerfilService);
  private dialogRef = inject(MatDialogRef<CambiarPasswordDialog>);
  private snackBar = inject(MatSnackBar);

  cargando = signal(false);
  error = signal<string | null>(null);
  ocultarActual = signal(true);
  ocultarNueva = signal(true);

  form = this.fb.group({
    passwordActual: ['', [Validators.required]],
    passwordNueva: ['', [Validators.required, Validators.minLength(8)]],
    confirmarPassword: ['', [Validators.required]]
  });

  guardar(): void {
    if (this.form.invalid) return;

    const { passwordActual, passwordNueva, confirmarPassword } = this.form.value;
    if (passwordNueva !== confirmarPassword) {
      this.error.set('Las contraseñas nuevas no coinciden.');
      return;
    }

    this.error.set(null);
    this.cargando.set(true);

    this.perfilService.cambiarPassword(passwordActual!, passwordNueva!).subscribe({
      next: () => {
        this.cargando.set(false);
        this.snackBar.open('Contraseña actualizada correctamente', 'Cerrar', { duration: 3000 });
        this.dialogRef.close();
      },
      error: (err) => {
        this.cargando.set(false);
        this.error.set(err.message ?? 'No se pudo cambiar la contraseña.');
      }
    });
  }

  cerrar(): void {
    this.dialogRef.close();
  }
}