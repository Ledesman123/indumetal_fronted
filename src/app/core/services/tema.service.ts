import { Injectable, signal } from '@angular/core';

export type Tema = 'claro' | 'oscuro';

const CLAVE_TEMA = 'indumetal_tema';

/**
 * Tema claro / oscuro. Aplica la clase `tema-oscuro` en <html> (las variables
 * de color estan en styles.scss) y recuerda la eleccion en el navegador.
 * Si el usuario nunca eligio, se respeta la preferencia del sistema operativo.
 */
@Injectable({ providedIn: 'root' })
export class TemaService {
  tema = signal<Tema>(this.temaInicial());

  constructor() {
    this.aplicar(this.tema());
  }

  alternar(): void {
    this.establecer(this.tema() === 'oscuro' ? 'claro' : 'oscuro');
  }

  establecer(tema: Tema): void {
    this.tema.set(tema);
    this.aplicar(tema);
    try {
      localStorage.setItem(CLAVE_TEMA, tema);
    } catch {
      // sin almacenamiento: el tema dura solo esta sesion
    }
  }

  private aplicar(tema: Tema): void {
    document.documentElement.classList.toggle('tema-oscuro', tema === 'oscuro');
  }

  private temaInicial(): Tema {
    try {
      const guardado = localStorage.getItem(CLAVE_TEMA);
      if (guardado === 'claro' || guardado === 'oscuro') return guardado;
    } catch {
      // continuar con la preferencia del sistema
    }
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'oscuro' : 'claro';
  }
}
