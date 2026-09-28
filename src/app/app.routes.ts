import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

const ROLES_OPERATIVOS = ['ADMINISTRADOR', 'SUPERVISOR_ALMACEN', 'JEFE_PRODUCCION', 'ALMACENERO'];
const ROLES_SIN_JEFE_PRODUCCION = ['ADMINISTRADOR', 'SUPERVISOR_ALMACEN', 'ALMACENERO'];
const ROLES_GERENCIALES = ['ADMINISTRADOR', 'SUPERVISOR_ALMACEN', 'JEFE_PRODUCCION'];

export const routes: Routes = [
  {
    path: 'login',
    title: 'Iniciar sesión',
    loadComponent: () => import('./features/login/login').then(m => m.Login)
  },
  {
    path: '',
    loadComponent: () => import('./layout/app-layout/app-layout').then(m => m.AppLayout),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        title: 'Panel',
        loadComponent: () => import('./features/dashboard/dashboard').then(m => m.Dashboard),
        canActivate: [roleGuard(ROLES_OPERATIVOS)]
      },
      {
        path: 'materiales',
        title: 'Materiales',
        loadComponent: () => import('./features/materiales/materiales-list/materiales-list').then(m => m.MaterialesList),
        canActivate: [roleGuard(ROLES_OPERATIVOS)]
      },
      {
        path: 'almacenes',
        title: 'Almacenes y ubicaciones',
        loadComponent: () => import('./features/almacenes/almacenes-list/almacenes-list').then(m => m.AlmacenesList),
        canActivate: [roleGuard(ROLES_OPERATIVOS)]
      },
      {
        path: 'movimientos',
        title: 'Movimientos',
        loadComponent: () => import('./features/movimientos/movimientos').then(m => m.Movimientos),
        canActivate: [roleGuard(ROLES_OPERATIVOS)]
      },
      {
        path: 'stock',
        title: 'Stock en tiempo real',
        loadComponent: () => import('./features/stock/stock').then(m => m.Stock),
        canActivate: [roleGuard(ROLES_OPERATIVOS)]
      },
      {
        path: 'inventario-fisico',
        title: 'Inventario físico',
        loadComponent: () => import('./features/inventario-fisico/inventario-fisico-list/inventario-fisico-list').then(m => m.InventarioFisicoList),
        canActivate: [roleGuard(ROLES_SIN_JEFE_PRODUCCION)]
      },
      {
        path: 'inventario-fisico/:id',
        title: 'Detalle de inventario',
        loadComponent: () => import('./features/inventario-fisico/inventario-fisico-detalle/inventario-fisico-detalle').then(m => m.InventarioFisicoDetalle),
        canActivate: [roleGuard(ROLES_SIN_JEFE_PRODUCCION)]
      },
      {
        path: 'alertas',
        title: 'Alertas de stock',
        loadComponent: () => import('./features/alertas/alertas').then(m => m.Alertas),
        canActivate: [roleGuard(ROLES_GERENCIALES)]
      },
      {
        path: 'reportes',
        title: 'Reportes',
        loadComponent: () => import('./features/reportes/reportes').then(m => m.Reportes),
        canActivate: [roleGuard(ROLES_GERENCIALES)]
      },
      {
        path: 'usuarios',
        title: 'Usuarios',
        loadComponent: () => import('./features/usuarios/usuarios-list/usuarios-list').then(m => m.UsuariosList),
        canActivate: [roleGuard(['ADMINISTRADOR'])]
      },
      {
        path: 'acceso-denegado',
        title: 'Acceso denegado',
        loadComponent: () => import('./features/acceso-denegado/acceso-denegado').then(m => m.AccesoDenegado)
      },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' }
    ]
  },
  { path: '**', redirectTo: '' }
];