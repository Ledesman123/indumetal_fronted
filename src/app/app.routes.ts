import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./features/login/login').then(m => m.Login) },
  {
    path: '',
    loadComponent: () => import('./layout/app-layout/app-layout').then(m => m.AppLayout),
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard').then(m => m.Dashboard) },
      { path: 'materiales', loadComponent: () => import('./features/materiales/materiales-list/materiales-list').then(m => m.MaterialesList) },
      { path: 'movimientos', loadComponent: () => import('./features/movimientos/movimientos').then(m => m.Movimientos) },
      { path: 'almacenes', loadComponent: () => import('./features/almacenes/almacenes-list/almacenes-list').then(m => m.AlmacenesList) },
      { path: 'inventario-fisico', loadComponent: () => import('./features/inventario-fisico/inventario-fisico-list/inventario-fisico-list').then(m => m.InventarioFisicoList) },
      { path: 'inventario-fisico/:id', loadComponent: () => import('./features/inventario-fisico/inventario-fisico-detalle/inventario-fisico-detalle').then(m => m.InventarioFisicoDetalle) },
      { path: 'reportes', loadComponent: () => import('./features/reportes/reportes').then(m => m.Reportes) }, { path: 'alertas', loadComponent: () => import('./features/alertas/alertas').then(m => m.Alertas) }, { path: 'stock', loadComponent: () => import('./features/stock/stock').then(m => m.Stock) },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' }
    ]
  },
  { path: '**', redirectTo: '' }
];