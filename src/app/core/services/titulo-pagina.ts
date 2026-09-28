import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

/** Pone "<Pantalla> · INDUMETAL" en la pestaña del navegador usando el `title` de cada ruta. */
@Injectable({ providedIn: 'root' })
export class TituloPagina extends TitleStrategy {
  private title = inject(Title);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const titulo = this.buildTitle(snapshot);
    this.title.setTitle(titulo ? `${titulo} · INDUMETAL` : 'INDUMETAL · Gestión de Almacén');
  }
}