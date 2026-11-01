import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { Material } from '../../core/models/material.model';
import { Ubicacion } from '../../core/models/ubicacion.model';
import { MovimientoAlmacen, TipoMovimiento } from '../../core/models/movimiento.model';
import { MaterialService } from '../../core/services/material.service';
import { UbicacionService } from '../../core/services/ubicacion.service';
import { MovimientoService } from '../../core/services/movimiento.service';
import { aFechaIso } from '../../core/services/dashboard.service';

@Component({
  selector: 'app-movimientos',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonToggleModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatTableModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './movimientos.html',
  styleUrl: './movimientos.scss'
})
export class Movimientos implements OnInit {
  private fb = inject(FormBuilder);
  private materialService = inject(MaterialService);
  private ubicacionService = inject(UbicacionService);
  private movimientoService = inject(MovimientoService);
  private snackBar = inject(MatSnackBar);

  tipoSeleccionado = signal<TipoMovimiento>('INGRESO');
  materiales = signal<Material[]>([]);
  ubicaciones = signal<Ubicacion[]>([]);
  historial = signal<MovimientoAlmacen[]>([]);
  cargando = signal(false);
  cargandoHistorial = signal(true);
  error = signal<string | null>(null);
  exito = signal<string | null>(null);

  columnasHistorial = ['fecha', 'tipo', 'material', 'ubicacion', 'cantidad', 'saldo', 'usuario'];

  form = this.fb.group({
    materialId: [null as number | null, Validators.required],
    ubicacionId: [null as number | null], // opcional en INGRESO (RF-07), obligatorio en el resto
    ubicacionDestinoId: [null as number | null], // solo TRANSFERENCIA
    cantidad: [null as number | null, [Validators.required, Validators.min(0.01)]],
    lote: [''],
    fechaVencimiento: [null as Date | null],
    ordenCompra: [''],
    proveedor: [''],
    ordenProduccion: [''],
    areaSolicitante: ['']
  });

  ngOnInit(): void {
    this.materialService.listar().subscribe((lista) => this.materiales.set(lista.filter((m) => m.activo)));
    this.ubicacionService.listarActivas().subscribe((lista) => this.ubicaciones.set(lista));
    this.cargarHistorial();
  }

  cambiarTipo(tipo: TipoMovimiento): void {
    this.tipoSeleccionado.set(tipo);
    this.error.set(null);
    this.exito.set(null);
    this.form.reset({ materialId: null, ubicacionId: null, ubicacionDestinoId: null, cantidad: null });
  }

  get esIngreso(): boolean { return this.tipoSeleccionado() === 'INGRESO'; }
  get esSalida(): boolean { return this.tipoSeleccionado() === 'SALIDA'; }
  get esDevolucion(): boolean { return this.tipoSeleccionado() === 'DEVOLUCION'; }
  get esTransferencia(): boolean { return this.tipoSeleccionado() === 'TRANSFERENCIA'; }

  registrar(): void {
    if (this.form.invalid) return;
    this.error.set(null);
    this.exito.set(null);
    this.cargando.set(true);

    const v = this.form.value;
    let operacion: Observable<unknown>;

    switch (this.tipoSeleccionado()) {
      case 'INGRESO':
        operacion = this.movimientoService.registrarIngreso({
          materialId: v.materialId!,
          ubicacionId: v.ubicacionId ?? null,
          cantidad: v.cantidad!,
          lote: v.lote || undefined,
          fechaVencimiento: v.fechaVencimiento ? aFechaIso(v.fechaVencimiento) : undefined,
          ordenCompra: v.ordenCompra || undefined,
          proveedor: v.proveedor || undefined
        });
        break;
      case 'SALIDA':
        operacion = this.movimientoService.registrarSalida({
          materialId: v.materialId!,
          ubicacionId: v.ubicacionId!,
          cantidad: v.cantidad!,
          ordenProduccion: v.ordenProduccion || undefined,
          areaSolicitante: v.areaSolicitante || undefined
        });
        break;
      case 'DEVOLUCION':
        operacion = this.movimientoService.registrarDevolucion({
          materialId: v.materialId!,
          ubicacionId: v.ubicacionId!,
          cantidad: v.cantidad!,
          ordenProduccion: v.ordenProduccion || undefined,
          motivo: v.areaSolicitante || undefined
        });
        break;
      case 'TRANSFERENCIA':
        operacion = this.movimientoService.registrarTransferencia({
          materialId: v.materialId!,
          ubicacionOrigenId: v.ubicacionId!,
          ubicacionDestinoId: v.ubicacionDestinoId!,
          cantidad: v.cantidad!
        });
        break;
    }

    operacion.subscribe({
      next: () => {
        this.cargando.set(false);
        this.exito.set('Movimiento registrado correctamente.');
        this.form.reset({ materialId: null, ubicacionId: null, ubicacionDestinoId: null, cantidad: null });
        this.cargarHistorial();
        this.snackBar.open('Movimiento registrado', 'Cerrar', { duration: 3000 });
      },
      error: (err) => {
        this.cargando.set(false);
        this.error.set(err.message ?? 'No se pudo registrar el movimiento.');
      }
    });
  }

  private cargarHistorial(): void {
    this.cargandoHistorial.set(true);
    this.movimientoService.listarMovimientos().subscribe({
      next: (lista) => {
        this.historial.set(lista);
        this.cargandoHistorial.set(false);
      },
      error: () => this.cargandoHistorial.set(false)
    });
  }

  etiquetaTipo(tipo: string): string {
    const etiquetas: Record<string, string> = {
      INGRESO: 'Ingreso',
      SALIDA: 'Salida',
      DEVOLUCION: 'Devolución',
      TRANSFERENCIA: 'Transferencia',
      TRANSFERENCIA_SALIDA: 'Transf. (salida)',
      TRANSFERENCIA_ENTRADA: 'Transf. (entrada)',
      AJUSTE_POSITIVO: 'Ajuste (+)',
      AJUSTE_NEGATIVO: 'Ajuste (−)'
    };
    return etiquetas[tipo] ?? tipo;
  }

  claseTipo(tipo: string): string {
    if (tipo.startsWith('TRANSFERENCIA')) return 'tipo-transferencia';
    if (tipo.startsWith('AJUSTE')) return 'tipo-ajuste';
    return 'tipo-' + tipo.toLowerCase();
  }
}