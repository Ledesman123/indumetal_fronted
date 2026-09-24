import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Usuario, ROLES_DISPONIBLES } from '../../../core/models/usuario.model';
import { UsuarioService } from '../../../core/services/usuario.service';
import { UsuarioFormDialog } from '../usuario-form-dialog/usuario-form-dialog';

@Component({
  selector: 'app-usuarios-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatSlideToggleModule, MatProgressBarModule],
  templateUrl: './usuarios-list.html',
  styleUrl: './usuarios-list.scss'
})
export class UsuariosList implements OnInit {
  private usuarioService = inject(UsuarioService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  columnas = ['nombre', 'correo', 'rol', 'estado', 'acciones'];
  usuarios = signal<Usuario[]>([]);
  cargando = signal(true);

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.usuarioService.listar().subscribe((lista) => {
      this.usuarios.set(lista);
      this.cargando.set(false);
    });
  }

  nuevoUsuario(): void {
    const ref = this.dialog.open(UsuarioFormDialog, { width: '480px', disableClose: true });
    ref.afterClosed().subscribe((creado) => {
      if (creado) {
        this.snackBar.open('Usuario creado correctamente', 'Cerrar', { duration: 3000 });
        this.cargar();
      }
    });
  }

  editarUsuario(usuario: Usuario): void {
    const ref = this.dialog.open(UsuarioFormDialog, { width: '480px', disableClose: true, data: { usuario } });
    ref.afterClosed().subscribe((actualizado) => {
      if (actualizado) {
        this.snackBar.open('Usuario actualizado correctamente', 'Cerrar', { duration: 3000 });
        this.cargar();
      }
    });
  }

  cambiarEstado(usuario: Usuario): void {
    const nuevoEstado = !usuario.activo;
    this.usuarioService.cambiarEstado(usuario.id, nuevoEstado).subscribe(() => {
      this.snackBar.open(nuevoEstado ? 'Usuario activado' : 'Usuario desactivado', 'Cerrar', { duration: 3000 });
      this.cargar();
    });
  }

  etiquetaRol(rol: string): string {
    return ROLES_DISPONIBLES.find((r) => r.valor === rol)?.etiqueta ?? rol;
  }
}