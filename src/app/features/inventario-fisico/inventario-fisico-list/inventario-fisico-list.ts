import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InventarioFisico } from '../../../core/models/inventario-fisico.model';
import { Almacen } from '../../../core/models/almacen.model';
import { InventarioFisicoService } from '../../../core/services/inventario-fisico.service';
import { AlmacenService } from '../../../core/services/almacen.service';

@Component({
  selector: 'app-inventario-fisico-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatSelectModule
  ],
  templateUrl: './inventario-fisico-list.html',
  styleUrl: './inventario-fisico-list.scss'
})
export class InventarioFisicoList implements OnInit {
  private inventarioService = inject(InventarioFisicoService);
  private almacenService = inject(AlmacenService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  columnas = ['id', 'almacen', 'fechaInicio', 'fechaCierre', 'responsable', 'estado', 'acciones'];
  inventarios = signal<InventarioFisico[]>([]);
  almacenes = signal<Almacen[]>([]);
  almacenSeleccionado = signal<number | null>(null);
  cargando = signal(true);
  iniciando = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.cargar();
    this.almacenService.listar().subscribe((lista) => {
      const activos = lista.filter((a) => a.activo);
      this.almacenes.set(activos);
      if (activos.length) this.almacenSeleccionado.set(activos[0].id);
    });
  }

  cargar(): void {
    this.cargando.set(true);
    this.inventarioService.listar().subscribe({
      next: (lista) => {
        this.inventarios.set(lista);
        this.cargando.set(false);
      },
      error: (err) => {
        this.cargando.set(false);
        this.error.set(err.message);
      }
    });
  }

  iniciarInventario(): void {
    const almacenId = this.almacenSeleccionado();
    if (!almacenId) return;

    this.iniciando.set(true);
    this.error.set(null);
    this.inventarioService.iniciar(almacenId).subscribe({
      next: (nuevo) => {
        this.iniciando.set(false);
        this.snackBar.open('Inventario iniciado. Registra el conteo físico.', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/inventario-fisico', nuevo.id]);
      },
      error: (err) => {
        this.iniciando.set(false);
        this.error.set(err.message ?? 'No se pudo iniciar el inventario.');
      }
    });
  }

  abrir(inventario: InventarioFisico): void {
    this.router.navigate(['/inventario-fisico', inventario.id]);
  }

  /** Solo se bloquea el inicio si el almacen seleccionado ya tiene un inventario abierto. */
  hayInventarioEnProceso(): boolean {
    const almacenId = this.almacenSeleccionado();
    return this.inventarios().some((i) => i.estado === 'EN_PROCESO' && i.almacenId === almacenId);
  }
}
