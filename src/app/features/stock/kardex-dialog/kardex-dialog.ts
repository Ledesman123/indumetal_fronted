import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { KardexItem } from '../../../core/models/kardex.model';
import { MovimientoService } from '../../../core/services/movimiento.service';

export interface KardexDialogData {
  materialId: number;
  materialSku: string;
  materialNombre: string;
}

@Component({
  selector: 'app-kardex-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatTableModule, MatButtonModule, MatIconModule, MatProgressBarModule],
  templateUrl: './kardex-dialog.html',
  styleUrl: './kardex-dialog.scss'
})
export class KardexDialog implements OnInit {
  data = inject<KardexDialogData>(MAT_DIALOG_DATA);
  private movimientoService = inject(MovimientoService);

  columnas = ['fecha', 'tipo', 'ubicacion', 'entrada', 'salida', 'saldo', 'referencia', 'usuario'];
  items = signal<KardexItem[]>([]);
  cargando = signal(true);

  ngOnInit(): void {
    this.movimientoService.listarKardex(this.data.materialId).subscribe((lista) => {
      this.items.set(lista);
      this.cargando.set(false);
    });
  }
}