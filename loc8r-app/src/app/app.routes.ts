import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'locations',
    loadComponent: () => import('./components/location-search/location-search.component').then(m => m.LocationSearchComponent)
  },
  // {
  //   path: 'locations/list',
  //   loadComponent: () => import('./components/location-list/location-list.component').then(m => m.LocationListComponent)
  // },
  // {
  //   path: 'locations/:id',
  //   loadComponent: () => import('./components/location-details/location-details.component').then(m => m.LocationDetailsComponent)
  // },
  {
    path: 'locations/add',
    loadComponent: () => import('./components/location-form/location-form.component').then(m => m.LocationFormComponent)
  },
  {
    path: 'locations/:id',
    loadComponent: () => import('./components/location-details-3/location-details-3.component').then(m => m.LocationDetails3Component)
  },
  {
    path: 'test-page',
    loadComponent: () => import('./components/test-page/test-page.component').then(m => m.TestPageComponent)
  },
  {
    path: 'test-search',
    loadComponent: () => import('./components/test-search/test-search.component').then(m => m.TestSearchComponent)
  },
];
