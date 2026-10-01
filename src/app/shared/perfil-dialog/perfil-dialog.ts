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
import { AuthService } from '../../core/services/auth.service';
import { PerfilService } from '../../core/services/perfil.service';
import { ROLES_DISPONIBLES } from '../../core/models/usuario.model';
import { CambiarPasswordDialog } from '../cambiar-password-dialog/cambiar-password-dialog';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-perfil-dialog',
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
  templateUrl: './perfil-dialog.html',
  styleUrl: './perfil-dialog.scss'
})
export class PerfilDialog {
  private fb = inject(FormBuilder);
  private perfilService = inject(PerfilService);
  private authService = inject(AuthService);
  private dialogRef = inject(MatDialogRef<PerfilDialog>);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  perfil = this.perfilService.obtenerPerfil();
  cargando = signal(false);
  error = signal<string | null>(null);
  arrastrandoFoto = signal(false);
  fotoPreview = signal<string | null>(this.perfil().fotoUrl);

  form = this.fb.group({
    nombres: [this.perfil().nombres, [Validators.required, Validators.maxLength(60)]],
    apellidos: [this.perfil().apellidos, [Validators.required, Validators.maxLength(60)]],
    telefono: [this.perfil().telefono, [Validators.maxLength(20)]]
  });

  etiquetaRol(rol: string): string {
    return ROLES_DISPONIBLES.find((r) => r.valor === rol)?.etiqueta ?? rol;
  }

  // ---------- Foto de perfil ----------

  onDragOver(evento: DragEvent): void {
    evento.preventDefault();
    this.arrastrandoFoto.set(true);
  }

  onDragLeave(evento: DragEvent): void {
    evento.preventDefault();
    this.arrastrandoFoto.set(false);
  }

  onDrop(evento: DragEvent): void {
    evento.preventDefault();
    this.arrastrandoFoto.set(false);
    const archivo = evento.dataTransfer?.files?.[0];
    if (archivo) this.procesarFoto(archivo);
  }

  onSeleccionarArchivo(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0];
    if (archivo) this.procesarFoto(archivo);
  }

  quitarFoto(): void {
    this.fotoPreview.set(null);
  }

  private procesarFoto(archivo: File): void {
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
    // TEMPORAL (Sprint 2): base64 en memoria para previsualizar. En Sprint 3
    // se sube el archivo a Supabase Storage y se guarda la URL publica.
    lector.onload = () => this.fotoPreview.set(lector.result as string);
    lector.readAsDataURL(archivo);
  }

  // ---------- Guardar ----------

  guardar(): void {
    if (this.form.invalid) return;

    this.error.set(null);
    this.cargando.set(true);

    this.perfilService
      .actualizar({
        nombres: this.form.value.nombres!,
        apellidos: this.form.value.apellidos!,
        telefono: this.form.value.telefono ?? '',
        fotoUrl: this.fotoPreview()
      })
      .subscribe({
        next: () => {
          this.cargando.set(false);
          this.snackBar.open('Perfil actualizado correctamente', 'Cerrar', { duration: 3000 });
        },
        error: () => {
          this.cargando.set(false);
          this.error.set('No se pudo actualizar el perfil.');
        }
      });
  }

  abrirCambiarPassword(): void {
    this.dialog.open(CambiarPasswordDialog, { width: '420px', disableClose: true });
  }

  cerrar(): void {
    this.dialogRef.close();
  }
}