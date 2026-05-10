import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./modules/auth/login.component')
      .then(m => m.LoginComponent)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/shell.component')
      .then(m => m.ShellComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./modules/dashboard/dashboard.component')
          .then(m => m.DashboardComponent)
      },
      {
        path: 'usuarios',
        loadComponent: () => import('./modules/usuarios/usuarios.component')
          .then(m => m.UsuariosComponent)
      },
      {
        path: 'bienes',
        loadComponent: () => import('./modules/bienes/bienes.component')
          .then(m => m.BienesComponent)
      },
      {
        path: 'requisiciones',
        loadComponent: () => import('./modules/proximamente/proximamente.component')
          .then(m => m.ProximamenteComponent)
      },
      {
        path: 'almacen',
        loadComponent: () => import('./modules/proximamente/proximamente.component')
          .then(m => m.ProximamenteComponent)
      },
      {
        path: 'bitacora',
        loadComponent: () => import('./modules/proximamente/proximamente.component')
          .then(m => m.ProximamenteComponent)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '' }
];
