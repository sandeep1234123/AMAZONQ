import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  { 
    path: 'charts', 
    loadComponent: () => import('./components/charts/charts.component').then(m => m.ChartsComponent)
  },
  { 
    path: 'maps', 
    loadComponent: () => import('./components/maps/maps.component').then(m => m.MapsComponent)
  }
];