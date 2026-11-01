import { Component, ElementRef, HostListener, computed, inject, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { MaterialService } from '../../core/services/material.service';
import { AlmacenService } from '../../core/services/almacen.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { Material } from '../../core/models/material.model';
import { Almacen } from '../../core/models/almacen.model';
import { Usuario } from '../../core/models/usuario.model';
import { MENU_POR_ROL } from '../menu.config';

interface Resultado {
  grupo: string;
  icono: string;
  titulo: string;
  detalle: string;
  ruta: string;
  query?: Record<string, string | number>;
}

const MAX_POR_GRUPO = 5;

/** Quita tildes y pasa a minusculas para comparar ("Almacén" == "almacen"). */
function normalizar(texto: string | null | undefined): string {
  return (texto ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

/**
 * Buscador global del header: materiales, almacenes, usuarios (solo admin) y
 * paginas del menu segun el rol. Los datos se cargan una vez al enfocar y se
 * filtran en el navegador. Atajo: Ctrl+K; flechas + Enter para elegir.
 */
@Component({
  selector: 'app-buscador-global',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './buscador-global.html',
  styleUrl: './buscador-global.scss'
})
export class BuscadorGlobal {
  private authService = inject(AuthService);
  private materialService = inject(MaterialService);
  private almacenService = inject(AlmacenService);
  private usuarioService = inject(UsuarioService);
  private router = inject(Router);
  private host = inject(ElementRef<HTMLElement>);

  private input = viewChild.required<ElementRef<HTMLInputElement>>('entrada');

  termino = signal('');
  abierto = signal(false);
  cargando = signal(false);
  activo = signal(0);

  private materiales = signal<Material[]>([]);
  private almacenes = signal<Almacen[]>([]);
  private usuarios = signal<Usuario[]>([]);
  private datosCargados = false;

  resultados = computed<Resultado[]>(() => {
    const t = normalizar(this.termino().trim());
    if (!t) return [];
    const coincide = (...campos: (string | null | undefined)[]) => campos.some((c) => normalizar(c).includes(t));

    const paginas: Resultado[] = (MENU_POR_ROL[this.authService.obtenerRol() ?? ''] ?? [])
      .filter((m) => coincide(m.etiqueta))
      .map((m) => ({ grupo: 'Páginas', icono: m.icono, titulo: m.etiqueta, detalle: 'Ir a la sección', ruta: m.ruta }));

    const materiales: Resultado[] = this.materiales()
      .filter((m) => coincide(m.sku, m.nombre, m.categoria, m.descripcion))
      .slice(0, MAX_POR_GRUPO)
      .map((m) => ({
        grupo: 'Materiales', icono: 'category', titulo: `${m.sku} — ${m.nombre}`,
        detalle: m.categoria.replace(/_/g, ' '), ruta: '/materiales', query: { buscar: m.sku }
      }));

    const almacenes: Resultado[] = this.almacenes()
      .filter((a) => coincide(a.codigo, a.nombre, a.direccion))
      .slice(0, MAX_POR_GRUPO)
      .map((a) => ({
        grupo: 'Almacenes', icono: 'warehouse', titulo: a.nombre,
        detalle: `${a.codigo}${a.direccion ? ' · ' + a.direccion : ''}`, ruta: '/almacenes', query: { id: a.id }
      }));

    const usuarios: Resultado[] = this.usuarios()
      .filter((u) => coincide(u.nombres, u.apellidos, `${u.nombres} ${u.apellidos}`, u.correo))
      .slice(0, MAX_POR_GRUPO)
      .map((u) => ({
        grupo: 'Usuarios', icono: 'person', titulo: `${u.nombres} ${u.apellidos}`,
        detalle: u.correo, ruta: '/usuarios'
      }));

    return [...paginas, ...materiales, ...almacenes, ...usuarios];
  });

  /** Resultados agrupados para el template, conservando el indice global (para las flechas). */
  grupos = computed(() => {
    const mapa = new Map<string, { resultado: Resultado; indice: number }[]>();
    this.resultados().forEach((resultado, indice) => {
      if (!mapa.has(resultado.grupo)) mapa.set(resultado.grupo, []);
      mapa.get(resultado.grupo)!.push({ resultado, indice });
    });
    return [...mapa.entries()].map(([nombre, items]) => ({ nombre, items }));
  });

  abrir(): void {
    this.abierto.set(true);
    if (!this.datosCargados) this.cargarDatos();
  }

  alEscribir(valor: string): void {
    this.termino.set(valor);
    this.activo.set(0);
    this.abrir();
  }

  alTeclear(evento: KeyboardEvent): void {
    const total = this.resultados().length;
    if (evento.key === 'ArrowDown' && total) {
      evento.preventDefault();
      this.activo.set((this.activo() + 1) % total);
    } else if (evento.key === 'ArrowUp' && total) {
      evento.preventDefault();
      this.activo.set((this.activo() - 1 + total) % total);
    } else if (evento.key === 'Enter' && total) {
      evento.preventDefault();
      this.elegir(this.resultados()[this.activo()]);
    } else if (evento.key === 'Escape') {
      this.cerrar();
      this.input().nativeElement.blur();
    }
  }

  elegir(resultado: Resultado): void {
    this.router.navigate([resultado.ruta], { queryParams: resultado.query ?? {} });
    this.termino.set('');
    this.input().nativeElement.value = '';
    this.cerrar();
    this.input().nativeElement.blur();
  }

  cerrar(): void {
    this.abierto.set(false);
  }

  @HostListener('document:keydown', ['$event'])
  atajo(evento: KeyboardEvent): void {
    if (evento.ctrlKey && evento.key.toLowerCase() === 'k') {
      evento.preventDefault();
      this.input().nativeElement.focus();
      this.abrir();
    }
  }

  @HostListener('document:click', ['$event'])
  clickFuera(evento: MouseEvent): void {
    if (!this.host.nativeElement.contains(evento.target as Node)) this.cerrar();
  }

  private cargarDatos(): void {
    this.datosCargados = true;
    this.cargando.set(true);
    const esAdmin = this.authService.obtenerRol() === 'ADMINISTRADOR';
    forkJoin({
      materiales: this.materialService.listar().pipe(catchError(() => of([] as Material[]))),
      almacenes: this.almacenService.listar().pipe(catchError(() => of([] as Almacen[]))),
      usuarios: esAdmin ? this.usuarioService.listar().pipe(catchError(() => of([] as Usuario[]))) : of([] as Usuario[])
    }).subscribe(({ materiales, almacenes, usuarios }) => {
      this.materiales.set(materiales);
      this.almacenes.set(almacenes.filter((a) => a.activo));
      this.usuarios.set(usuarios);
      this.cargando.set(false);
    });
    // Se vuelven a pedir en la proxima apertura pasados unos minutos (datos frescos).
    setTimeout(() => (this.datosCargados = false), 5 * 60_000);
  }
}
