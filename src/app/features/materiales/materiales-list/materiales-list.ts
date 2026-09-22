import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Material, CATEGORIAS_MATERIAL } from '../../../core/models/material.model';
import { MaterialService } from '../../../core/services/material.service';
import { MaterialFormDialog } from '../material-form-dialog/material-form-dialog';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-materiales-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressBarModule
  ],
  templateUrl: './materiales-list.html',
  styleUrl: './materiales-list.scss'
})
export class MaterialesList implements OnInit {
  private materialService = inject(MaterialService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  columnas = ['imagen', 'sku', 'nombre', 'categoria', 'stock', 'costo', 'estado', 'acciones'];
  materiales = signal<Material[]>([]);
  cargando = signal(true);
  termino = '';
  categoriaSeleccionada: string | null = null;
  categorias = CATEGORIAS_MATERIAL;

  ngOnInit(): void {
    this.cargarMateriales();
  }

  cargarMateriales(): void {
    this.cargando.set(true);
    this.materialService.buscar(this.termino, this.categoriaSeleccionada).subscribe((lista) => {
      this.materiales.set(lista);
      this.cargando.set(false);
    });
  }

  nuevoMaterial(): void {
    const ref = this.dialog.open(MaterialFormDialog, { width: '560px', disableClose: true });
    ref.afterClosed().subscribe((creado) => {
      if (creado) {
        this.snackBar.open('Material creado correctamente', 'Cerrar', { duration: 3000 });
        this.cargarMateriales();
      }
    });
  }

  editarMaterial(material: Material): void {
    const ref = this.dialog.open(MaterialFormDialog, {
      width: '560px',
      disableClose: true,
      data: { material }
    });
    ref.afterClosed().subscribe((actualizado) => {
      if (actualizado) {
        this.snackBar.open('Material actualizado correctamente', 'Cerrar', { duration: 3000 });
        this.cargarMateriales();
      }
    });
  }

  desactivarMaterial(material: Material): void {
    const ref = this.dialog.open(ConfirmDialog, {
      width: '400px',
      data: {
        titulo: 'Desactivar material',
        mensaje: `¿Seguro que deseas desactivar "${material.nombre}"? No se eliminará el historial de movimientos.`,
        textoConfirmar: 'Desactivar',
        color: 'warn'
      }
    });

    ref.afterClosed().subscribe((confirmado) => {
      if (confirmado) {
        this.materialService.desactivar(material.id).subscribe(() => {
          this.snackBar.open('Material desactivado', 'Cerrar', { duration: 3000 });
          this.cargarMateriales();
        });
      }
    });
  }

  etiquetaCategoria(categoria: string): string {
    return categoria.replace('_', ' ');
  }
}