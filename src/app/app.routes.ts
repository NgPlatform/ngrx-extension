import type { Routes } from '@angular/router';

export const routes: Routes = [
	{
		path: 'with-storage-sync',
		loadComponent: () =>
			import('./pages/with-storage-sync/with-storage-sync.component').then(
				(M) => M.WithStorageSyncComponent,
			),
	},
	{
		path: 'patch-state-with-immer',
		loadComponent: () =>
			import(
				'./pages/patch-state-with-immer/patch-state-with-immer.component'
			).then((M) => M.PatchStateWithImmerComponent),
	},
	{
		path: '**',
		redirectTo: 'patch-state-with-immer',
	},
];
