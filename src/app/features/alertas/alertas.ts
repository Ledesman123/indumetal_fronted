import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Router } from '@angular/router';
import { StockUbicacion } from '../../core/models/stock.model';
import { MovimientoService } from '../../core/services/movimiento.service';

@Component({
  selector: 'app-alertas',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatProgressBarModule],
  templateUrl: './alertas.html',
  styleUrl: './alertas.scss'
})
export class Alertas implements OnInit {
  private movimientoService = inject(MovimientoService);
  private router = inject(Router);

  materialesEnAlerta = signal<StockUbicacion[]>([]);
  cargando = signal(true);

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.movimientoService.listarStock().subscribe((lista) => {
      this.materialesEnAlerta.set(lista.filter((s) => s.cantidad < s.stockMinimo));
      this.cargando.set(false);
    });
  }

  faltante(item: StockUbicacion): number {
    return item.stockMinimo - item.cantidad;
  }

  irARegistrarIngreso(): void {
    this.router.navigate(['/movimientos']);
  }
}