import { MenuItem } from './menu-item.model';

export const MENU_POR_ROL: Record<string, MenuItem[]> = {
  ADMINISTRADOR: [
    { etiqueta: 'Panel', icono: 'dashboard', ruta: '/dashboard' },
    { etiqueta: 'Materiales', icono: 'category', ruta: '/materiales' },
    { etiqueta: 'Almacenes', icono: 'warehouse', ruta: '/almacenes' }
  ],
  SUPERVISOR_ALMACEN: [
    { etiqueta: 'Panel', icono: 'dashboard', ruta: '/dashboard' },
    { etiqueta: 'Materiales', icono: 'category', ruta: '/materiales' },
    { etiqueta: 'Almacenes', icono: 'warehouse', ruta: '/almacenes' }
  ],
  JEFE_PRODUCCION: [
    { etiqueta: 'Panel', icono: 'dashboard', ruta: '/dashboard' },
    { etiqueta: 'Materiales', icono: 'category', ruta: '/materiales' },
    { etiqueta: 'Almacenes', icono: 'warehouse', ruta: '/almacenes' }
  ],
  ALMACENERO: [
    { etiqueta: 'Materiales', icono: 'category', ruta: '/materiales' },
    { etiqueta: 'Almacenes', icono: 'warehouse', ruta: '/almacenes' }
  ]
};