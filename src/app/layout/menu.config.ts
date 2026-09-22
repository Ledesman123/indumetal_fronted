import { MenuItem } from './menu-item.model';

/**
 * Que ve cada rol en el sidebar. A medida que construyamos mas modulos
 * (almacenes, movimientos, kardex, etc.) solo hay que agregar la entrada
 * aqui — el layout no necesita tocarse.
 */
export const MENU_POR_ROL: Record<string, MenuItem[]> = {
  ADMINISTRADOR: [
    { etiqueta: 'Panel', icono: 'dashboard', ruta: '/dashboard' },
    { etiqueta: 'Materiales', icono: 'category', ruta: '/materiales' }
  ],
  SUPERVISOR_ALMACEN: [
    { etiqueta: 'Panel', icono: 'dashboard', ruta: '/dashboard' },
    { etiqueta: 'Materiales', icono: 'category', ruta: '/materiales' }
  ],
  JEFE_PRODUCCION: [
    { etiqueta: 'Panel', icono: 'dashboard', ruta: '/dashboard' },
    { etiqueta: 'Materiales', icono: 'category', ruta: '/materiales' }
  ],
  ALMACENERO: [
    { etiqueta: 'Materiales', icono: 'category', ruta: '/materiales' }
  ]
};