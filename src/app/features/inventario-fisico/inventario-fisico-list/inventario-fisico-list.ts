import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InventarioFisico } from '../../../core/models/inventario-fisico.model';
import { InventarioFisicoService } from '../../../core/services/inventario-fisico.service';

@Component({
  selector: 'app-inventario-fisico-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatProgressBarModule],
  templateUrl: './inventario-fisico-list.html',
  styleUrl: './inventario-fisico-list.scss'
})
export class InventarioFisicoList implements OnInit {
  private inventarioService = inject(InventarioFisicoService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  columnas = ['id', 'fechaInicio', 'fechaCierre', 'responsable', 'estado', 'acciones'];
  inventarios = signal<InventarioFisico[]>([]);
  cargando = signal(true);
  iniciando = signal(false);

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.inventarioService.listar().subscribe((lista) => {
      this.inventarios.set(lista);
      this.cargando.set(false);
    });
  }

  iniciarInventario(): void {
    this.iniciando.set(true);
    this.inventarioService.iniciar().subscribe((nuevo) => {
      this.iniciando.set(false);
      this.snackBar.open('Inventario iniciado. Registra el conteo físico.', 'Cerrar', { duration: 3000 });
      this.router.navigate(['/inventario-fisico', nuevo.id]);
    });
  }

  abrir(inventario: InventarioFisico): void {
    this.router.navigate(['/inventario-fisico', inventario.id]);
  }

  hayInventarioEnProceso(): boolean {
    return this.inventarios().some((i) => i.estado === 'EN_PROCESO');
  }
}