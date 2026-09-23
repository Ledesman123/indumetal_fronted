import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InventarioFisico } from '../../../core/models/inventario-fisico.model';
import { InventarioFisicoService } from '../../../core/services/inventario-fisico.service';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-inventario-fisico-detalle',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressBarModule
  ],
  templateUrl: './inventario-fisico-detalle.html',
  styleUrl: './inventario-fisico-detalle.scss'
})
export class InventarioFisicoDetalle implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private inventarioService = inject(InventarioFisicoService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  columnas = ['material', 'ubicacion', 'stockSistema', 'stockContado', 'diferencia'];
  inventario = signal<InventarioFisico | null>(null);
  cargando = signal(true);
  cerrando = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.cargar(id);
  }

  cargar(id: number): void {
    this.cargando.set(true);
    this.inventarioService.obtenerPorId(id).subscribe((inv) => {
      this.inventario.set(inv);
      this.cargando.set(false);
    });
  }

  registrarConteo(materialId: number, ubicacionId: number, valor: number | string): void {
    const inv = this.inventario();
    if (!inv) return;

    const cantidad = Number(valor);
    if (isNaN(cantidad) || cantidad < 0) return;

    this.inventarioService.registrarConteo(inv.id, materialId, ubicacionId, cantidad).subscribe((actualizado) => {
      this.inventario.set(actualizado);
    });
  }

  get todoContado(): boolean {
    return this.inventario()?.items.every((item) => item.stockContado !== null) ?? false;
  }

  cerrarInventario(): void {
    const inv = this.inventario();
    if (!inv) return;

    const ref = this.dialog.open(ConfirmDialog, {
      width: '420px',
      data: {
        titulo: 'Cerrar inventario',
        mensaje: 'Al cerrar, el stock del sistema se ajustará a lo contado físicamente. Esta acción no se puede deshacer. ¿Continuar?',
        textoConfirmar: 'Cerrar inventario',
        color: 'warn'
      }
    });

    ref.afterClosed().subscribe((confirmado) => {
      if (!confirmado) return;

      this.cerrando.set(true);
      this.error.set(null);
      this.inventarioService.cerrar(inv.id).subscribe({
        next: (cerrado) => {
          this.cerrando.set(false);
          this.inventario.set(cerrado);
          this.snackBar.open('Inventario cerrado y stock ajustado', 'Cerrar', { duration: 3000 });
        },
        error: (err) => {
          this.cerrando.set(false);
          this.error.set(err.message ?? 'No se pudo cerrar el inventario.');
        }
      });
    });
  }

  volver(): void {
    this.router.navigate(['/inventario-fisico']);
  }
}