import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialog } from '@angular/material/dialog';
import { StockUbicacion } from '../../core/models/stock.model';
import { MovimientoService } from '../../core/services/movimiento.service';
import { KardexDialog } from './kardex-dialog/kardex-dialog';

@Component({
  selector: 'app-stock',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatProgressBarModule
  ],
  templateUrl: './stock.html',
  styleUrl: './stock.scss'
})
export class Stock implements OnInit {
  private movimientoService = inject(MovimientoService);
  private dialog = inject(MatDialog);

  columnas = ['material', 'almacen', 'ubicacion', 'cantidad', 'rango', 'estado', 'acciones'];
  stockCompleto = signal<StockUbicacion[]>([]);
  cargando = signal(true);
  termino = '';

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.movimientoService.listarStock().subscribe((lista) => {
      this.stockCompleto.set(lista);
      this.cargando.set(false);
    });
  }

  get stockFiltrado(): StockUbicacion[] {
    if (!this.termino) return this.stockCompleto();
    const t = this.termino.toLowerCase();
    return this.stockCompleto().filter(
      (s) => s.materialNombre.toLowerCase().includes(t) || s.materialSku.toLowerCase().includes(t)
    );
  }

  estaEnAlerta(item: StockUbicacion): boolean {
    return item.cantidad < item.stockMinimo;
  }

  porcentajeDeLlenado(item: StockUbicacion): number {
    if (item.stockMaximo <= 0) return 0;
    return Math.min((item.cantidad / item.stockMaximo) * 100, 100);
  }

  verKardex(item: StockUbicacion): void {
    this.dialog.open(KardexDialog, {
      width: '720px',
      data: { materialId: item.materialId, materialNombre: item.materialNombre, materialSku: item.materialSku }
    });
  }
}