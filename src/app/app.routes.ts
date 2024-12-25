import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path:'with-storage-sync',
    loadComponent:() => import('./pages/with-storage-sync/with-storage-sync.component').then((M) => M.WithStorageSyncComponent),
  }
];
