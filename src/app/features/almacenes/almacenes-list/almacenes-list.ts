import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Almacen } from '../../../core/models/almacen.model';
import { Ubicacion } from '../../../core/models/ubicacion.model';
import { AlmacenService } from '../../../core/services/almacen.service';
import { UbicacionService } from '../../../core/services/ubicacion.service';
import { AlmacenFormDialog } from '../almacen-form-dialog/almacen-form-dialog';
import { UbicacionFormDialog } from '../ubicacion-form-dialog/ubicacion-form-dialog';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-almacenes-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatTooltipModule,
    MatProgressBarModule
  ],
  templateUrl: './almacenes-list.html',
  styleUrl: './almacenes-list.scss'
})
export class AlmacenesList implements OnInit {
  private almacenService = inject(AlmacenService);
  private ubicacionService = inject(UbicacionService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  almacenes = signal<Almacen[]>([]);
  ubicaciones = signal<Ubicacion[]>([]);
  almacenSeleccionado = signal<Almacen | null>(null);
  cargandoAlmacenes = signal(true);
  cargandoUbicaciones = signal(false);

  columnasUbicacion = ['codigo', 'estado', 'acciones'];

  ngOnInit(): void {
    this.cargarAlmacenes();
  }

  cargarAlmacenes(): void {
    this.cargandoAlmacenes.set(true);
    this.almacenService.listar().subscribe((lista) => {
      this.almacenes.set(lista);
      this.cargandoAlmacenes.set(false);

      // Si ya habia uno seleccionado, refresca sus datos; si no, selecciona el primero.
      const actual = this.almacenSeleccionado();
      const paraSeleccionar = actual ? lista.find((a) => a.id === actual.id) : lista[0];
      if (paraSeleccionar) this.seleccionarAlmacen(paraSeleccionar);
    });
  }

  seleccionarAlmacen(almacen: Almacen): void {
    this.almacenSeleccionado.set(almacen);
    this.cargandoUbicaciones.set(true);
    this.ubicacionService.listarPorAlmacen(almacen.id).subscribe((lista) => {
      this.ubicaciones.set(lista);
      this.cargandoUbicaciones.set(false);
    });
  }

  nuevoAlmacen(): void {
    const ref = this.dialog.open(AlmacenFormDialog, { width: '480px', disableClose: true });
    ref.afterClosed().subscribe((creado) => {
      if (creado) {
        this.snackBar.open('Almacén creado correctamente', 'Cerrar', { duration: 3000 });
        this.cargarAlmacenes();
      }
    });
  }

  editarAlmacen(almacen: Almacen, evento: Event): void {
    evento.stopPropagation();
    const ref = this.dialog.open(AlmacenFormDialog, { width: '480px', disableClose: true, data: { almacen } });
    ref.afterClosed().subscribe((actualizado) => {
      if (actualizado) {
        this.snackBar.open('Almacén actualizado correctamente', 'Cerrar', { duration: 3000 });
        this.cargarAlmacenes();
      }
    });
  }

  desactivarAlmacen(almacen: Almacen, evento: Event): void {
    evento.stopPropagation();
    const ref = this.dialog.open(ConfirmDialog, {
      width: '400px',
      data: {
        titulo: 'Desactivar almacén',
        mensaje: `¿Seguro que deseas desactivar "${almacen.nombre}"?`,
        textoConfirmar: 'Desactivar',
        color: 'warn'
      }
    });
    ref.afterClosed().subscribe((confirmado) => {
      if (confirmado) {
        this.almacenService.desactivar(almacen.id).subscribe(() => {
          this.snackBar.open('Almacén desactivado', 'Cerrar', { duration: 3000 });
          this.cargarAlmacenes();
        });
      }
    });
  }

  nuevaUbicacion(): void {
    const almacen = this.almacenSeleccionado();
    if (!almacen) return;

    const ref = this.dialog.open(UbicacionFormDialog, {
      width: '400px',
      disableClose: true,
      data: { almacenId: almacen.id }
    });
    ref.afterClosed().subscribe((creada) => {
      if (creada) {
        this.snackBar.open('Ubicación creada correctamente', 'Cerrar', { duration: 3000 });
        this.seleccionarAlmacen(almacen);
      }
    });
  }

  editarUbicacion(ubicacion: Ubicacion): void {
    const ref = this.dialog.open(UbicacionFormDialog, {
      width: '400px',
      disableClose: true,
      data: { almacenId: ubicacion.almacenId, ubicacion }
    });
    ref.afterClosed().subscribe((actualizada) => {
      if (actualizada) {
        this.snackBar.open('Ubicación actualizada correctamente', 'Cerrar', { duration: 3000 });
        this.seleccionarAlmacen(this.almacenSeleccionado()!);
      }
    });
  }

  desactivarUbicacion(ubicacion: Ubicacion): void {
    const ref = this.dialog.open(ConfirmDialog, {
      width: '400px',
      data: {
        titulo: 'Desactivar ubicación',
        mensaje: `¿Seguro que deseas desactivar la ubicación "${ubicacion.codigo}"?`,
        textoConfirmar: 'Desactivar',
        color: 'warn'
      }
    });
    ref.afterClosed().subscribe((confirmado) => {
      if (confirmado) {
        this.ubicacionService.desactivar(ubicacion.id).subscribe(() => {
          this.snackBar.open('Ubicación desactivada', 'Cerrar', { duration: 3000 });
          this.seleccionarAlmacen(this.almacenSeleccionado()!);
        });
      }
    });
  }
}