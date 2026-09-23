import { MenuItem } from './menu-item.model';

export const MENU_POR_ROL: Record<string, MenuItem[]> = {
  ADMINISTRADOR: [
    { etiqueta: 'Panel', icono: 'dashboard', ruta: '/dashboard' },
    { etiqueta: 'Materiales', icono: 'category', ruta: '/materiales' },
    { etiqueta: 'Almacenes', icono: 'warehouse', ruta: '/almacenes' },
    { etiqueta: 'Movimientos', icono: 'swap_horiz', ruta: '/movimientos' },
    { etiqueta: 'Stock', icono: 'inventory', ruta: '/stock' },
    { etiqueta: 'Inventario físico', icono: 'playlist_add_check', ruta: '/inventario-fisico' }
  ],
  SUPERVISOR_ALMACEN: [
    { etiqueta: 'Panel', icono: 'dashboard', ruta: '/dashboard' },
    { etiqueta: 'Materiales', icono: 'category', ruta: '/materiales' },
    { etiqueta: 'Almacenes', icono: 'warehouse', ruta: '/almacenes' },
    { etiqueta: 'Movimientos', icono: 'swap_horiz', ruta: '/movimientos' },
    { etiqueta: 'Stock', icono: 'inventory', ruta: '/stock' },
    { etiqueta: 'Inventario físico', icono: 'playlist_add_check', ruta: '/inventario-fisico' }
  ],
  JEFE_PRODUCCION: [
    { etiqueta: 'Panel', icono: 'dashboard', ruta: '/dashboard' },
    { etiqueta: 'Materiales', icono: 'category', ruta: '/materiales' },
    { etiqueta: 'Almacenes', icono: 'warehouse', ruta: '/almacenes' },
    { etiqueta: 'Movimientos', icono: 'swap_horiz', ruta: '/movimientos' },
    { etiqueta: 'Stock', icono: 'inventory', ruta: '/stock' }
  ],
  ALMACENERO: [
    { etiqueta: 'Materiales', icono: 'category', ruta: '/materiales' },
    { etiqueta: 'Almacenes', icono: 'warehouse', ruta: '/almacenes' },
    { etiqueta: 'Movimientos', icono: 'swap_horiz', ruta: '/movimientos' },
    { etiqueta: 'Stock', icono: 'inventory', ruta: '/stock' },
    { etiqueta: 'Inventario físico', icono: 'playlist_add_check', ruta: '/inventario-fisico' }
  ]
};