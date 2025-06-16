import { Routes } from '@angular/router';
import { TabsComponent } from './components/tabs/tabs.component';
export const routes: Routes = [
  {
    path: '',
    component: TabsComponent,
    children: [
      {
        path: 'home',
        loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
      },    
      {
        path: 'locations',
        loadComponent: () => import('./components/location-search/location-search.component').then(m => m.LocationSearchComponent)
      },      
      {
        path: 'locations/:id',
        loadComponent: () => import('./components/location-details-3/location-details-3.component').then(m => m.LocationDetails3Component)
      },
      {
        path: 'locations-add',
        loadComponent: () => import('./components/location-form/location-form.component').then(m => m.LocationFormComponent)
      },
      {
        path: 'fsq-locations',
        loadComponent: () => import('./components/fsq-import/fsq-import.component').then(m => m.FsqImportComponent)
      }, 
      {
        path: 'profile',
        loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent)
      }, 
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  // {
  //   path: 'home',
  //   loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  // },
  // {
  //   path: '',
  //   redirectTo: 'home',
  //   pathMatch: 'full',
  // },
  // {
  //   path: 'locations',
  //   loadComponent: () => import('./components/location-search/location-search.component').then(m => m.LocationSearchComponent)
  // },
  // {
  //   path: 'locations/add',
  //   loadComponent: () => import('./components/location-form/location-form.component').then(m => m.LocationFormComponent)
  // },
  // {
  //   path: 'locations/:id',
  //   loadComponent: () => import('./components/location-details-3/location-details-3.component').then(m => m.LocationDetails3Component)
  // },
  // {
  //   path: 'test-page',
  //   loadComponent: () => import('./components/test-page/test-page.component').then(m => m.TestPageComponent)
  // },
  // {
  //   path: 'test-search',
  //   loadComponent: () => import('./components/test-search/test-search.component').then(m => m.TestSearchComponent)
  // },
  // {
  //   path: 'tabs',
  //   loadComponent: () => import('./components/tabs/tabs.component').then(m => m.TabsComponent)
  // },
];
